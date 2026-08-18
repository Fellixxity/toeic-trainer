'use strict';

const CAT_NAMES = {
  pos:       '品詞',
  prep:      '前置詞・接続詞',
  gram:      '文法一般',
  gerund:    '前置詞+動名詞',
  colloc:    '語彙コロケーション',
  reading:   '長文読解',
  listening: 'リスニング応答',
  vocab:     '語彙（塊で暗記）',
};

// Part 2 の問いかけの型（解答後のヒント表示に使う）
const PTYPE_NAMES = {
  wh:        'WH疑問文',
  yesno:     'Yes/No疑問文',
  statement: '平叙文',
  choice:    '選択疑問文',
  tag:       '付加疑問文',
  request:   '依頼・提案',
};

/**
 * Part ごとの制限時間（秒）
 * 本番の目安は Part 5 が20〜30秒、Part 7 は1問1分＋本文を読む時間。
 * 全Part一律45秒だと長文が明らかに足りないため Part 別に持つ。
 */
const TIMER_BY_PART = { 2: 20, 5: 45, 6: 60, 7: 90, vocab: 12 };

/**
 * 保持する解答履歴の上限。
 * 1日100問ペースだと500件では5日分しか残らず、連続学習日数と
 * 7日間グラフが過去を失う。1件あたり約120バイトなので5000件でも1MB弱。
 */
const HISTORY_LIMIT = 5000;
const TIMER_DEFAULT = 45;
// パッセージの1問目には本文を読む時間を加算する
const PASSAGE_READ_BONUS = 60;
const TIMER_CIRCUMFERENCE = 138.23;

const App = {
  srsData: {},
  history: [],
  selectedPart: 5, // 2, 5, 6, 7, 'mix'
  timerEnabled: true,
  listeningShowScript: false,

  session: {
    questions: [],
    currentIndex: 0,
    answered: false,
    results: []
  },

  timer: {
    id: null,
    timeLeft: TIMER_DEFAULT,
    total: TIMER_DEFAULT
  }
};

/**
 * その問題の持ち時間を返す
 * @param {object} q セッション中の問題（_firstOfPassage が付く場合がある）
 */
function getTimerSeconds(q) {
  const base = TIMER_BY_PART[q.part] || TIMER_DEFAULT;
  return q._firstOfPassage ? base + PASSAGE_READ_BONUS : base;
}

/**
 * 履歴1件を一意に識別するキー
 * タイムスタンプは端末が "…Z"、Supabase が "…+00:00" を返すので、
 * 文字列のままでは同じ解答を別物と誤認する。エポックミリ秒に正規化して比較する。
 */
function historyKey(h) {
  const t = new Date(h.timestamp).getTime();
  return `${h.questionId}|${Number.isFinite(t) ? t : h.timestamp}`;
}

/**
 * 履歴の重複を取り除く
 * 同一解答が複数あるときは durationSec が実測値（クラウド既定の15秒でない方）を優先する。
 */
function dedupeHistory(list) {
  const map = new Map();
  (list || []).forEach(h => {
    if (!h || !h.questionId || !h.timestamp) return;
    const k = historyKey(h);
    const prev = map.get(k);
    if (!prev) { map.set(k, h); return; }
    const prevIsFallback = (prev.durationSec || 15) === 15;
    const curIsFallback = (h.durationSec || 15) === 15;
    if (prevIsFallback && !curIsFallback) map.set(k, h);
  });
  return [...map.values()].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function loadData() {
  try {
    App.srsData = JSON.parse(localStorage.getItem('toeic_srs') || '{}');
    App.history = JSON.parse(localStorage.getItem('toeic_history') || '[]');
  } catch (_) {
    App.srsData = {};
    App.history = [];
  }

  // 過去に二重登録された履歴をここで一度きれいにする
  const before = App.history.length;
  App.history = dedupeHistory(App.history);
  if (App.history.length !== before) {
    console.info(`履歴の重複を除去しました: ${before} → ${App.history.length} 件`);
    localStorage.setItem('toeic_history', JSON.stringify(App.history));
  }

  buildVocabQuestions();
  loadGeneratedQuestions();
}

function saveData() {
  localStorage.setItem('toeic_srs', JSON.stringify(App.srsData));
  if (App.history.length > HISTORY_LIMIT) App.history = App.history.slice(-HISTORY_LIMIT);
  localStorage.setItem('toeic_history', JSON.stringify(App.history));
}

/**
 * 語彙デッキから出題オブジェクトを組み立てて問題バンクに合流させる。
 *
 * 意味を選ばせる形式は正答率90%で負荷が足りなかったため、例文の一語を空所にした
 * 穴埋めにしてある。実際に落ちているのは意味の認識ではなく文中での使い分けのため。
 * 誤答は同じ品詞から決め打ちで選ぶ（毎回変えると SRS の難度が安定しないため）。
 */
function buildVocabQuestions() {
  if (typeof VOCAB_BANK === 'undefined') return;
  const n = VOCAB_BANK.length;
  if (n < 4) return;
  // loadData() が再度呼ばれても二重に積まないこと
  if (QUESTION_BANK.some(q => q.part === 'vocab')) return;

  // 誤答は必ず同じ品詞から取る。品詞が混ざると明らかに形の違う語が並び、
  // 中身を知らなくても消去法で当たってしまう。
  const byPos = {};
  VOCAB_BANK.forEach(w => { (byPos[w.pos || 'noun'] ||= []).push(w); });

  // 抜く語は「その語句を最も特徴づける語」。
  // 単純に先頭語を抜くと in / at / on ばかりになり、前置詞句どうしで
  // 選択肢が重複して4択が成立しなかった。デッキ全体での出現頻度が
  // 低い語ほど特徴的とみなす。
  const STOP = new Set(['a', 'an', 'the', 'of', 'to', 'be', 'your', 'my', 'our', 'is', 'are']);
  const freq = {};
  VOCAB_BANK.forEach(w => w.term.toLowerCase().split(' ').forEach(t => {
    if (!STOP.has(t)) freq[t] = (freq[t] || 0) + 1;
  }));

  const keyWord = term => {
    const parts = term.split(' ').filter(t => !STOP.has(t.toLowerCase()));
    if (parts.length === 0) return term.split(' ')[0];
    return parts.reduce((best, t) =>
      (freq[t.toLowerCase()] || 0) < (freq[best.toLowerCase()] || 0) ? t : best);
  };

  const blankKeyWord = (sentence, term) => {
    const word = keyWord(term);
    const re = new RegExp(`(^|[^A-Za-z])(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})([^A-Za-z]|$)`, 'i');
    const m = sentence.match(re);
    if (!m) return null;
    const start = m.index + m[1].length;
    return { cloze: sentence.slice(0, start) + '-------' + sentence.slice(start + m[2].length), word };
  };

  VOCAB_BANK.forEach((w, i) => {
    const made = blankKeyWord(w.ex, w.term);
    if (!made) return;

    // 同じ品詞の語句から誤答を決定的に選ぶ（毎回変えると難度が安定しない）。
    // 同じ抜き語が当たると4択にならないので、重複しないものを順に拾う。
    const same = (byPos[w.pos || 'noun'] || []).filter(x => x.id !== w.id);
    const pool = (same.length >= 3 ? same : VOCAB_BANK.filter(x => x.id !== w.id));
    const cloze = made.cloze;
    const choices = [made.word];
    const used = new Set([made.word.toLowerCase()]);
    for (let k = 0; k < pool.length && choices.length < 4; k++) {
      const cand = keyWord(pool[(i * 3 + k * 5) % pool.length].term);
      if (used.has(cand.toLowerCase())) continue;
      used.add(cand.toLowerCase());
      choices.push(cand);
    }
    if (choices.length !== 4) return;

    const explanation = `${w.term} = ${w.ja}\n例: ${w.ex}${w.note ? '\n' + w.note : ''}`;

    // ヒントなし（実力確認）とヒントあり（覚えたて用）の2種類。
    // 意味を選ばせる形式は正答率90%で負荷が足りなかったため、
    // どちらも文脈に当てはめる形にしてある。
    QUESTION_BANK.push({
      id: `${w.id}_e`, part: 'vocab', passageId: null, cat: 'vocab', vocabId: w.id,
      q: cloze, choices, a: 0, exp: explanation
    });
    QUESTION_BANK.push({
      id: `${w.id}_j`, part: 'vocab', passageId: null, cat: 'vocab', vocabId: w.id,
      q: `${cloze}\n（ヒント: ${w.ja}）`, choices, a: 0, exp: explanation
    });
  });
}

/**
 * AI が生成した問題を localStorage から復元して QUESTION_BANK に合流させる
 * （QUESTION_BANK に push するだけではリロードで消えてしまうため）
 */
function loadGeneratedQuestions() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('toeic_generated_questions') || '[]');
  } catch (_) {
    saved = [];
  }
  if (!Array.isArray(saved)) return;

  const existingIds = new Set(QUESTION_BANK.map(q => q.id));
  saved.forEach(q => {
    if (q && q.id && !existingIds.has(q.id)) {
      QUESTION_BANK.push(q);
      existingIds.add(q.id);
    }
  });
}

function saveGeneratedQuestions(newQuestions) {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('toeic_generated_questions') || '[]');
  } catch (_) {
    saved = [];
  }
  if (!Array.isArray(saved)) saved = [];
  const merged = [...saved, ...newQuestions].slice(-200);
  localStorage.setItem('toeic_generated_questions', JSON.stringify(merged));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function selectPartTab(part) {
  App.selectedPart = part;
  document.querySelectorAll('.part-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.part == part);
  });
  renderHome();
}

function filterQuestionsByPart() {
  if (App.selectedPart === 'mix') return QUESTION_BANK;
  return QUESTION_BANK.filter(q => q.part == App.selectedPart);
}

function getStats() {
  const now = today();
  const records = App.srsData;
  const pool = filterQuestionsByPart();

  const dueReviews = pool.filter(q => {
    const r = records[q.id];
    if (!r || r.status === 'new' || r.status === 'graduated') return false;
    if (!r.nextReview) return true;
    return new Date(r.nextReview) <= now;
  });

  const newQuestions = pool.filter(q => {
    const r = records[q.id];
    return !r || r.status === 'new';
  });

  const recent = App.history.slice(-20);
  const accuracy = recent.length > 0
    ? Math.round(recent.filter(h => h.correct).length / recent.length * 100)
    : null;

  const catStats = {};
  App.history.forEach(h => {
    if (!catStats[h.category]) catStats[h.category] = { correct: 0, total: 0 };
    catStats[h.category].total++;
    if (h.correct) catStats[h.category].correct++;
  });

  let weakCat = null;
  let lowestAcc = Infinity;
  Object.entries(catStats).forEach(([cat, s]) => {
    if (s.total >= 3) {
      const acc = s.correct / s.total;
      if (acc < lowestAcc) { lowestAcc = acc; weakCat = cat; }
    }
  });

  const graduated = pool.filter(q => {
    const r = records[q.id];
    return r && r.status === 'graduated';
  }).length;

  return { dueReviews, newQuestions, accuracy, weakCat, graduated, totalInPart: pool.length };
}

/**
 * 1セッションの問題数。語彙は1問十数秒で回せるので多めにする。
 */
function sessionSize() {
  return App.selectedPart === 'vocab' ? 20 : 10;
}

function buildSession() {
  const { dueReviews, newQuestions } = getStats();
  const size = sessionSize();

  let pool = shuffle([...dueReviews]).slice(0, size);

  if (pool.length < size && newQuestions.length > 0) {
    const needed = size - pool.length;
    pool = [...pool, ...shuffle([...newQuestions]).slice(0, needed)];
  }

  pool = shuffle(pool);

  // 同じパッセージの何問目かを見て、最初の1問にだけ読む時間を足す
  const seenPassages = new Set();

  return pool.map(q => {
    const shuffledChoices = shuffle(
      q.choices.map((text, originalIndex) => ({ text, originalIndex }))
    );
    let firstOfPassage = false;
    if (q.passageId) {
      firstOfPassage = !seenPassages.has(q.passageId);
      seenPassages.add(q.passageId);
    }
    return { ...q, shuffledChoices, _firstOfPassage: firstOfPassage };
  });
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'entering');
  });
  const el = document.getElementById(id);
  el.classList.add('active');
  requestAnimationFrame(() => el.classList.add('entering'));
}

function startTimer(seconds) {
  stopTimer();
  const container = document.getElementById('timer-container');

  // タイマーOFF のときは時間切れにせず、表示も隠す
  if (!App.timerEnabled) {
    if (container) container.style.visibility = 'hidden';
    return;
  }
  if (container) container.style.visibility = 'visible';

  App.timer.total = seconds || TIMER_DEFAULT;
  App.timer.timeLeft = App.timer.total;
  updateTimerUI();

  App.timer.id = setInterval(() => {
    App.timer.timeLeft--;
    updateTimerUI();
    if (App.timer.timeLeft <= 0) {
      stopTimer();
      onTimeExpired();
    }
  }, 1000);
}

function toggleTimer() {
  App.timerEnabled = !App.timerEnabled;
  localStorage.setItem('toeic_timer_enabled', JSON.stringify(App.timerEnabled));
  updateTimerToggleUI();
  if (!App.timerEnabled) stopTimer();
}

function updateTimerToggleUI() {
  const btn = document.getElementById('timer-toggle-btn');
  if (!btn) return;
  btn.textContent = App.timerEnabled ? '⏱ タイマーON' : '⏱ タイマーOFF';
  btn.style.opacity = App.timerEnabled ? '1' : '0.55';
  btn.title = App.timerEnabled
    ? 'タイマーOFFにする（じっくり解く）'
    : 'タイマーONにする（本番と同じ時間制限）';
}

function stopTimer() {
  if (App.timer.id) {
    clearInterval(App.timer.id);
    App.timer.id = null;
  }
}

function updateTimerUI() {
  const t = App.timer.timeLeft;
  const ring = document.getElementById('timer-ring');
  const text = document.getElementById('timer-text');
  if (!ring || !text) return;

  const pct = Math.max(0, t / (App.timer.total || TIMER_DEFAULT));
  ring.style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - pct);
  text.textContent = t;

  if (t <= 10) {
    ring.style.stroke = '#ef4444';
    text.style.color = '#ef4444';
  } else {
    ring.style.stroke = '#3b82f6';
    text.style.color = 'var(--text)';
  }
}

function onTimeExpired() {
  if (App.session.answered) return;
  App.session.answered = true;
  processAnswer(null, false);
  renderAnswerFeedback(null, false, true);
}

function renderHome() {
  const stats = getStats();

  setText('due-count', stats.dueReviews.length);
  setText('new-count', stats.newQuestions.length);

  // 復習が1セッション（10問）に収まらないときは消化ペースが分かるよう補足する
  const dueNote = document.getElementById('due-note');
  if (dueNote) {
    dueNote.textContent = stats.dueReviews.length > sessionSize()
      ? `うち${sessionSize()}問を出題`
      : '';
  }

  // 学習時間表示
  const timeStats = Analytics.getStudyTimeStats(App.history);
  setText('study-time-today', timeStats.todayFormatted);

  // Streak 計算 & 表示
  const streak = Analytics.calculateStreak(App.history);
  setText('streak-count', `🔥 ${streak}日`);

  const pct = stats.totalInPart > 0 ? Math.round(stats.graduated / stats.totalInPart * 100) : 0;
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${pct}%`;
  setText('progress-text', `${stats.graduated} / ${stats.totalInPart} 問 卒業済み`);

  // 予想スコア計算 & 表示
  const pred = Analytics.calculatePredictedScore(
    App.history, App.srsData, QUESTION_BANK.length, new Set(QUESTION_BANK.map(q => q.id))
  );
  setText('predicted-score-val', pred.score);
  setText('predicted-rank', pred.rank);

  // 過去7日間の成果グラフを描画
  const chartContainer = document.getElementById('chart-container');
  if (chartContainer) {
    const dailyStats = Analytics.getDailyStats(App.history, 7);
    chartContainer.innerHTML = Analytics.renderDailyChartSvg(dailyStats);
  }

  renderMastery();
  renderForecast();
  renderUntouchedNudge();
  renderBacklog();

  // 掃除ボタンは不要なレコードがあるときだけ出す
  const cleanupBtn = document.getElementById('cleanup-btn');
  if (cleanupBtn) {
    const n = findOrphanSrs().length;
    cleanupBtn.style.display = n > 0 ? '' : 'none';
    const lbl = document.getElementById('cleanup-btn-label');
    if (lbl) lbl.textContent = `不要な復習データ ${n} 件を整理`;
  }

  // 苦手だけモードのラベル（対象がなければ無効化）
  const weakBtn = document.getElementById('weak-btn');
  const weakLbl = document.getElementById('weak-btn-label');
  if (weakBtn) {
    const weak = getWeakPool();
    weakBtn.disabled = weak.length === 0;
    weakBtn.style.opacity = weak.length === 0 ? '0.45' : '1';
    if (weakLbl) {
      weakLbl.textContent = weak.length === 0
        ? '苦手データがまだありません'
        : `苦手だけ ${Math.min(weak.length, 10)}問（${CAT_NAMES[stats.weakCat] || '間違えた問題'}中心）`;
    }
  }

  const available = stats.dueReviews.length + stats.newQuestions.length;
  const btn = document.getElementById('start-btn');
  const noMsg = document.getElementById('all-done-msg');
  const subLbl = document.getElementById('btn-start-sub');

  if (available === 0) {
    btn.disabled = true;
    noMsg.style.display = 'block';
    if (subLbl) subLbl.textContent = '';
  } else {
    btn.disabled = false;
    noMsg.style.display = 'none';
    const size = sessionSize();
    const dueCount = Math.min(stats.dueReviews.length, size);
    const newCount = Math.min(size - dueCount, stats.newQuestions.length);
    const parts = [];
    if (dueCount > 0) parts.push(`復習 ${dueCount}問`);
    if (newCount > 0) parts.push(`新規 ${newCount}問`);
    if (subLbl) subLbl.textContent = parts.join(' + ');
  }
}

/**
 * 学習データを外部で分析できる形に書き出す。
 * 問題文そのものは含めず、ID・カテゴリ・正誤・所要時間だけを出す。
 */
function buildExportPayload() {
  const byId = {};
  QUESTION_BANK.forEach(q => { byId[q.id] = q; });

  return {
    exportedAt: new Date().toISOString(),
    app: 'toeic-trainer',
    counts: {
      questionBank: QUESTION_BANK.length,
      history: App.history.length,
      srs: Object.keys(App.srsData).length
    },
    history: App.history.map(h => ({
      qid: h.questionId,
      cat: h.category,
      part: byId[h.questionId]?.part ?? null,
      correct: h.correct,
      sec: h.durationSec ?? null,
      at: h.timestamp
    })),
    srs: Object.entries(App.srsData).map(([qid, r]) => ({
      qid,
      cat: byId[qid]?.cat ?? null,
      part: byId[qid]?.part ?? null,
      status: r.status,
      interval: r.interval,
      streak: r.correctStreak,
      attempts: r.attempts,
      correct: r.correctCount,
      nextReview: r.nextReview,
      lastReviewed: r.lastReviewed
    }))
  };
}

/**
 * 存在しない問題を指すSRSレコード（孤児）を探す。
 * かつてAI生成問題が保存されない不具合があった頃の残骸。
 * 別端末で生成した問題を巻き添えにしないよう、自動では消さず明示操作にしている。
 */
function findOrphanSrs() {
  const valid = new Set(QUESTION_BANK.map(q => q.id));
  return Object.keys(App.srsData).filter(qid => !valid.has(qid));
}

function openOrphanCleanupModal() {
  const orphans = findOrphanSrs();
  if (orphans.length === 0) {
    openModal('🧹 復習データの掃除', '<p>不要なレコードはありません。</p>');
    return;
  }
  openModal('🧹 復習データの掃除', `
    <p>いまアプリに無い問題を指す復習レコードが <strong>${orphans.length} 件</strong> あります。</p>
    <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">
      以前AI生成問題が保存されなかった頃の残骸です。問題本体が存在しないため出題されることはなく、
      統計にだけ影響します。削除しても学習中の問題の進捗は失われません。
    </p>
    <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">
      別の端末でAI生成した問題がある場合、その進捗も消える点にご注意ください。
    </p>
    <button onclick="runOrphanCleanup()" style="width:100%; padding:12px; margin-top:14px; background:var(--purple,#a855f7); color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">${orphans.length} 件を削除する</button>
  `);
}

async function runOrphanCleanup() {
  const orphans = findOrphanSrs();
  openModal('🧹 削除中…', '<p>復習データを整理しています。</p>');
  orphans.forEach(qid => { delete App.srsData[qid]; });
  saveData();
  const removedCloud = await Auth.deleteSrsRecords(orphans);
  renderHome();
  openModal('🧹 完了', `
    <p>${orphans.length} 件を削除しました。</p>
    <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">
      ${removedCloud > 0 ? 'クラウド側からも削除済みです。' : 'ログインしていないため、この端末のみ削除しました。'}
      残りの復習レコードは ${Object.keys(App.srsData).length} 件です。
    </p>
  `);
}

async function exportStudyData() {
  const json = JSON.stringify(buildExportPayload());
  const sizeKb = Math.round(json.length / 1024);
  let copied = false;
  try {
    await navigator.clipboard.writeText(json);
    copied = true;
  } catch (_) { /* 権限が無い場合はダウンロードで渡す */ }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const stamp = Analytics.dateKey();

  openModal('📤 学習データの書き出し', `
    <p>${copied ? 'クリップボードにコピーしました。そのまま貼り付けて分析を依頼できます。' : 'クリップボードが使えなかったので、下のリンクから保存してください。'}</p>
    <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">
      履歴 ${App.history.length} 件 / SRS ${Object.keys(App.srsData).length} 件 / 約 ${sizeKb} KB<br>
      問題文は含まれません（ID・カテゴリ・正誤・所要時間のみ）。
    </p>
    <a href="${url}" download="toeic-study-${stamp}.json" style="display:inline-block; margin-top:12px; padding:10px 16px; background:var(--blue,#3b82f6); color:#fff; border-radius:8px; text-decoration:none; font-size:14px;">ファイルとして保存</a>
  `);
}

/**
 * ほとんど手をつけていない Part があれば、そこへ誘導する。
 * 苦手より先に「まだ始めていない領域」を潰す方がスコアは動く。
 */
/**
 * 選択中のタブに関係なく、全体でどれだけ復習が滞っているかを出す。
 *
 * 「今日の復習」は選択中Partの分しか数えないため、語彙タブだけを回していると
 * 他Partの期限切れが画面に出ず、放置されていることに気づけなかった。
 */
function getBacklog() {
  const now = today();
  const overdue = [];
  const dueToday = [];
  QUESTION_BANK.forEach(q => {
    const r = App.srsData[q.id];
    if (!r || r.status === 'new' || r.status === 'graduated') return;
    if (!r.nextReview) { dueToday.push(q); return; }
    const d = new Date(r.nextReview);
    d.setHours(0, 0, 0, 0);
    if (d < now) overdue.push(q);
    else if (d.getTime() === now.getTime()) dueToday.push(q);
  });
  return { overdue, dueToday };
}

function renderBacklog() {
  const el = document.getElementById('backlog-card');
  if (!el) return;
  const { overdue, dueToday } = getBacklog();
  const total = overdue.length + dueToday.length;

  if (overdue.length === 0) { el.style.display = 'none'; return; }

  // 卒業まであと1回正解すればよいものを数える（消化の動機になるので出す）
  const nearGraduation = [...overdue, ...dueToday].filter(q => {
    const r = App.srsData[q.id];
    return r && r.interval >= 4 && r.correctStreak >= 1;
  }).length;

  const byPart = {};
  overdue.forEach(q => { byPart[q.part] = (byPart[q.part] || 0) + 1; });
  const partLabel = { 2: 'Part 2', 5: 'Part 5', 6: 'Part 6', 7: 'Part 7', vocab: '単語' };
  const breakdown = Object.entries(byPart)
    .sort((a, b) => b[1] - a[1])
    .map(([p, n]) => `${partLabel[p] || p} ${n}`)
    .join(' ・ ');

  el.style.display = '';
  el.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <span style="font-size:20px;">⏳</span>
      <div style="flex:1; min-width:200px;">
        <div style="font-size:14px; font-weight:600;">期限切れの復習が ${overdue.length} 件たまっています</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
          ${breakdown}${dueToday.length ? `（本日期限がさらに ${dueToday.length} 件）` : ''}<br>
          ${nearGraduation > 0 ? `うち ${nearGraduation} 件は次に正解すれば卒業します。` : ''}
        </div>
      </div>
      <button onclick="startBacklogSession()" style="background:var(--purple,#a855f7); color:#fff; border:none; border-radius:8px; padding:10px 16px; font-size:13px; cursor:pointer; white-space:nowrap;">まとめて復習 ▶</button>
    </div>`;
}

/**
 * Part をまたいで、期限切れの古い順に出題する
 */
function startBacklogSession() {
  const { overdue, dueToday } = getBacklog();
  const pool = [...overdue, ...dueToday];
  if (pool.length === 0) return;

  const byDue = q => {
    const r = App.srsData[q.id];
    return r && r.nextReview ? new Date(r.nextReview).getTime() : 0;
  };
  const picked = [...pool].sort((a, b) => byDue(a) - byDue(b)).slice(0, 20);
  launchSession(picked);
}

function renderUntouchedNudge() {
  const el = document.getElementById('nudge-card');
  if (!el) return;

  const attempted = {};
  QUESTION_BANK.forEach(q => {
    attempted[q.part] = attempted[q.part] || { total: 0, done: 0 };
    attempted[q.part].total++;
    const r = App.srsData[q.id];
    if (r && r.status && r.status !== 'new') attempted[q.part].done++;
  });

  const PART_LABEL = { 2: 'Part 2（リスニング応答）', 5: 'Part 5', 6: 'Part 6', 7: 'Part 7', vocab: '単語（語彙デッキ）' };
  const target = Object.entries(attempted)
    .filter(([, v]) => v.total >= 5 && v.done / v.total < 0.2)
    .sort((a, b) => (a[1].done / a[1].total) - (b[1].done / b[1].total))[0];

  if (!target || App.selectedPart == target[0]) { el.style.display = 'none'; return; }

  const [part, v] = target;
  el.style.display = '';
  el.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <span style="font-size:20px;">💡</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-size:14px; font-weight:600;">${PART_LABEL[part] || 'Part ' + part} がほぼ未着手です</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${v.total}問中 ${v.done}問しか解いていません。伸びしろが一番大きい場所です。</div>
      </div>
      <button onclick="selectPartTab(${isNaN(Number(part)) ? `'${part}'` : part}); startSession();" style="background:var(--blue,#3b82f6); color:#fff; border:none; border-radius:8px; padding:10px 16px; font-size:13px; cursor:pointer; white-space:nowrap;">ここから始める ▶</button>
    </div>`;
}

function renderMastery() {
  const el = document.getElementById('mastery-list');
  if (!el) return;
  const rows = Analytics.getCategoryMastery(App.history, App.srsData, QUESTION_BANK, CAT_NAMES);
  el.innerHTML = rows.map(r => {
    const acc = r.accuracy;
    const color = acc === null ? 'var(--text-muted)'
      : acc >= 80 ? '#22c55e'
      : acc >= 60 ? '#f59e0b'
      : '#ef4444';
    const accLabel = acc === null ? '未着手' : `${acc}%`;
    const barWidth = acc === null ? 0 : acc;
    return `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px;">
        <span class="cat-badge cat-${r.cat}" style="flex-shrink:0; min-width:104px; text-align:center;">${r.label}</span>
        <div style="flex:1; height:7px; background:rgba(255,255,255,0.07); border-radius:999px; overflow:hidden;">
          <div style="width:${barWidth}%; height:100%; background:${color}; border-radius:999px;"></div>
        </div>
        <span style="font-size:11px; color:${color}; min-width:38px; text-align:right;">${accLabel}</span>
        <span style="font-size:10px; color:var(--text-muted); min-width:52px; text-align:right;">🎓${r.graduated}/${r.total}</span>
      </div>`;
  }).join('');
}

function renderForecast() {
  const el = document.getElementById('forecast-list');
  if (!el) return;
  const buckets = Analytics.getReviewForecast(App.srsData, QUESTION_BANK, 7);
  const max = Math.max(...buckets.map(b => b.count), 1);
  el.innerHTML = buckets.map(b => {
    const h = Math.round((b.count / max) * 44);
    return `
      <div style="flex:1; text-align:center;">
        <div style="font-size:10px; color:${b.count ? 'var(--text)' : 'var(--text-muted)'}; margin-bottom:3px;">${b.count || ''}</div>
        <div style="height:${Math.max(h, 2)}px; background:${b.count ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.08)'}; border-radius:4px 4px 0 0;"></div>
        <div style="font-size:9px; color:var(--text-muted); margin-top:3px;">${b.label}</div>
      </div>`;
  }).join('');
}

/**
 * 苦手だけモードの出題候補
 * 卒業していない問題のうち、直近で間違えたものと、苦手カテゴリの未卒業問題を集める。
 */
function getWeakPool() {
  const wrongIds = new Set();
  App.history.slice(-120).forEach(h => { if (!h.correct) wrongIds.add(h.questionId); });

  const mastery = Analytics.getCategoryMastery(App.history, App.srsData, QUESTION_BANK, CAT_NAMES);
  const weakCats = new Set(
    mastery.filter(m => m.accuracy !== null && m.accuracy < 80 && m.answered >= 3).map(m => m.cat)
  );

  return QUESTION_BANK.filter(q => {
    const r = App.srsData[q.id];
    if (r && r.status === 'graduated') return false;
    return wrongIds.has(q.id) || weakCats.has(q.cat);
  });
}

function startWeakSession() {
  const pool = getWeakPool();
  if (pool.length === 0) return;

  // 過去に間違えた問題を優先し、残りを苦手カテゴリから補充する
  const wrongIds = new Set();
  App.history.slice(-120).forEach(h => { if (!h.correct) wrongIds.add(h.questionId); });
  const missed = shuffle(pool.filter(q => wrongIds.has(q.id)));
  const rest = shuffle(pool.filter(q => !wrongIds.has(q.id)));
  const picked = [...missed, ...rest].slice(0, 10);

  launchSession(picked);
}

function startSession() {
  const questions = buildSession();
  if (questions.length === 0) return;

  App.session = { questions, currentIndex: 0, answered: false, results: [] };
  showScreen('screen-quiz');
  renderQuestion();
}

/**
 * 任意の問題配列でセッションを開始する（苦手だけモード用）
 */
function launchSession(rawQuestions) {
  const seenPassages = new Set();
  const questions = shuffle(rawQuestions).map(q => {
    let firstOfPassage = false;
    if (q.passageId) {
      firstOfPassage = !seenPassages.has(q.passageId);
      seenPassages.add(q.passageId);
    }
    return {
      ...q,
      shuffledChoices: shuffle(q.choices.map((text, originalIndex) => ({ text, originalIndex }))),
      _firstOfPassage: firstOfPassage
    };
  });
  if (questions.length === 0) return;
  App.session = { questions, currentIndex: 0, answered: false, results: [] };
  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const { session } = App;
  const q = session.questions[session.currentIndex];
  session.answered = false;

  const idx = session.currentIndex;
  const total = session.questions.length;

  setText('q-num', idx + 1);
  setText('q-total', total);
  const qFill = document.getElementById('quiz-progress-fill');
  if (qFill) qFill.style.width = `${(idx / total) * 100}%`;

  const badge = document.getElementById('q-cat');
  if (badge) {
    badge.textContent = q.part === 'vocab'
      ? (CAT_NAMES[q.cat] || q.cat)
      : `Part ${q.part} · ${CAT_NAMES[q.cat] || q.cat}`;
    badge.className = `cat-badge cat-${q.cat || 'pos'}`;
  }

  // Part 6 / Part 7 パッセージ表示
  const passageCard = document.getElementById('passage-card');
  if (q.passageId && PASSAGE_BANK[q.passageId]) {
    const passage = PASSAGE_BANK[q.passageId];
    passageCard.classList.remove('hidden');
    setText('passage-title', `[Part ${passage.part}] ${passage.title}`);
    
    let textHtml = passage.text;
    if (q.blankNum) {
      textHtml = textHtml.replace(`[${q.blankNum}]-------`, `<span class="blank">[${q.blankNum}] _______</span>`);
    }
    document.getElementById('passage-text').innerHTML = textHtml;
  } else {
    passageCard.classList.add('hidden');
  }

  const isListening = q.part === 2;
  const showScript = isListening && App.listeningShowScript;

  // 問題文（リスニングは解答するまで本文を見せない）
  const qText = document.getElementById('question-card');
  if (qText) {
    const body = isListening && !showScript
      ? '<p class="q-text" style="color:var(--text-muted);">🎧 音声を聞いて、最も適切な応答を選んでください。</p>'
      : `<p class="q-text">${(q.q || '空所に最も適切な選択肢を選んでください。').replace('-------', '<span class="blank">_______</span>')}</p>`;
    qText.innerHTML = body;
  }

  // リスニング用の再生コントロール
  const audioBar = document.getElementById('audio-bar');
  if (audioBar) audioBar.classList.toggle('hidden', !isListening);

  const LABELS = ['A', 'B', 'C', 'D'];
  const choicesEl = document.getElementById('choices');
  if (choicesEl) {
    choicesEl.innerHTML = q.shuffledChoices.map((c, i) => {
      // リスニングでは選択肢も音声のみ。解答後にスクリプトを出す
      const label = (isListening && !showScript) ? '（音声）' : c.text;
      return `
      <button class="choice-btn" id="choice-${i}" onclick="selectAnswer(${i})">
        <span class="choice-label">${LABELS[i]}</span>
        <span class="choice-text" id="choice-text-${i}">${label}</span>
      </button>
    `;
    }).join('');
  }

  document.getElementById('answer-reveal')?.classList.add('hidden');
  document.getElementById('next-btn')?.classList.add('hidden');

  App.session.questionStartTime = Date.now();

  if (isListening) {
    // 音声が流れ終わってから制限時間を数え始める（読み上げ中に切れないように）
    playListening({ autoStart: true });
  } else {
    TTS.cancel();
    startTimer(getTimerSeconds(q));
  }
}

/**
 * Part 2 の音声を再生する。問いかけ → (A) → (B) → (C) の順。
 */
function playListening(opts = {}) {
  const q = App.session.questions[App.session.currentIndex];
  if (!q || q.part !== 2) return;

  stopTimer();
  const btn = document.getElementById('replay-btn');
  const status = document.getElementById('audio-status');
  if (btn) btn.disabled = true;

  const LABELS = ['A', 'B', 'C', 'D'];
  const items = [
    { text: q.q, pauseAfterMs: 900 },
    ...q.shuffledChoices.map((c, i) => ({
      text: `${LABELS[i]}. ${c.text}`,
      pauseAfterMs: 700
    }))
  ];

  TTS.speakSequence(items, {
    onItem: (i) => {
      if (!status) return;
      status.textContent = i === 0 ? '🔊 問いかけを再生中…' : `🔊 応答 ${LABELS[i - 1]} を再生中…`;
    },
    onEnd: () => {
      if (btn) btn.disabled = false;
      if (status) status.textContent = '再生が終わりました。もう一度聞くには ↻ を押してください。';
      // 解答済みなら数え直さない
      if (!App.session.answered && opts.autoStart !== false) {
        startTimer(getTimerSeconds(q));
      }
    }
  });
}

function toggleListeningScript() {
  App.listeningShowScript = !App.listeningShowScript;
  localStorage.setItem('toeic_listening_script', JSON.stringify(App.listeningShowScript));
  updateListeningScriptUI();
  // 出題中なら表示を切り替える
  const q = App.session.questions[App.session.currentIndex];
  if (q && q.part === 2 && !App.session.answered) {
    const showScript = App.listeningShowScript;
    const card = document.getElementById('question-card');
    if (card) {
      card.innerHTML = showScript
        ? `<p class="q-text">${q.q}</p>`
        : '<p class="q-text" style="color:var(--text-muted);">🎧 音声を聞いて、最も適切な応答を選んでください。</p>';
    }
    q.shuffledChoices.forEach((c, i) => {
      const el = document.getElementById(`choice-text-${i}`);
      if (el) el.textContent = showScript ? c.text : '（音声）';
    });
  }
}

function updateListeningScriptUI() {
  const btn = document.getElementById('script-toggle-btn');
  if (!btn) return;
  btn.textContent = App.listeningShowScript ? '📖 スクリプト表示中' : '📖 スクリプト非表示';
  btn.style.opacity = App.listeningShowScript ? '1' : '0.55';
}

function cycleTtsRate() {
  const rates = [0.75, 0.9, 1.0];
  const cur = TTS.getRate();
  const next = rates[(rates.indexOf(cur) + 1) % rates.length] || 0.9;
  TTS.setRate(next);
  updateTtsRateUI();
}

function updateTtsRateUI() {
  const btn = document.getElementById('rate-btn');
  if (!btn) return;
  const r = TTS.getRate();
  const label = r <= 0.75 ? 'ゆっくり' : (r >= 1.0 ? '本番速度' : '標準');
  btn.textContent = `🐢 ${label}`;
}

function selectAnswer(selectedIdx) {
  const { session } = App;
  if (session.answered) return;
  session.answered = true;
  stopTimer();

  const q = session.questions[session.currentIndex];
  const isCorrect = q.shuffledChoices[selectedIdx].originalIndex === q.a;

  processAnswer(selectedIdx, isCorrect);
  renderAnswerFeedback(selectedIdx, isCorrect, false);
}

function processAnswer(selectedIdx, isCorrect) {
  const { session } = App;
  const q = session.questions[session.currentIndex];

  const durationSec = Math.max(1, Math.round((Date.now() - (session.questionStartTime || Date.now())) / 1000));

  const existing = App.srsData[q.id] || { status: 'new', interval: 0, correctStreak: 0, attempts: 0, correctCount: 0 };
  const updated = SRS.updateRecord(existing, isCorrect);
  App.srsData[q.id] = updated;

  const historyEntry = {
    questionId: q.id,
    correct: isCorrect,
    timestamp: new Date().toISOString(),
    category: q.cat,
    durationSec: durationSec
  };
  App.history.push(historyEntry);

  session.results.push({ questionId: q.id, correct: isCorrect, category: q.cat });

  saveData();
  Auth.syncUp(q.id, updated);
  Auth.syncHistoryUp(historyEntry);
}

function renderAnswerFeedback(selectedIdx, isCorrect, timeExpired) {
  const { session } = App;
  const q = session.questions[session.currentIndex];
  const record = App.srsData[q.id];

  q.shuffledChoices.forEach((c, i) => {
    const btn = document.getElementById(`choice-${i}`);
    if (!btn) return;
    btn.disabled = true;
    if (c.originalIndex === q.a) {
      btn.classList.add('state-correct');
    } else if (i === selectedIdx && !isCorrect && !timeExpired) {
      btn.classList.add('state-wrong');
    }
  });

  // 音声フィードバック
  if (isCorrect && !timeExpired) {
    Sound.playCorrect();
    // 卒業時は紙吹雪
    const record = App.srsData[q.id];
    if (record && record.status === 'graduated') {
      Confetti.fire();
    }
  } else {
    Sound.playWrong();
  }

  // バッジ
  const badge = document.getElementById('result-badge');
  if (badge) {
    if (timeExpired) {
      badge.textContent = '⏱ 時間切れ';
      badge.className = 'result-badge wrong';
    } else if (isCorrect) {
      badge.textContent = '✓ 正解！';
      badge.className = 'result-badge correct';
    } else {
      badge.textContent = '✗ 不正解';
      badge.className = 'result-badge wrong';
    }
  }

  // リスニングは解答後にスクリプトを開示する（復習できないと意味がないため）
  if (q.part === 2) {
    TTS.cancel();
    const card = document.getElementById('question-card');
    if (card) {
      const ptype = PTYPE_NAMES[q.ptype] ? `<span style="font-size:12px; color:var(--text-muted);">問いかけの型: ${PTYPE_NAMES[q.ptype]}</span><br>` : '';
      card.innerHTML = `${ptype}<p class="q-text">${q.q}</p>`;
    }
    q.shuffledChoices.forEach((c, i) => {
      const el = document.getElementById(`choice-text-${i}`);
      if (el) el.textContent = c.text;
    });
    const status = document.getElementById('audio-status');
    if (status) status.textContent = '↻ でもう一度聞けます（スクリプトを見ながら音を確認しましょう）';
  }

  let srsMsg = '';
  if (record.status === 'graduated') {
    srsMsg = '🎓 卒業！おめでとうございます';
  } else if (isCorrect && !timeExpired) {
    srsMsg = `次回: ${SRS.nextReviewLabel(record)}（間隔 ${record.interval}日）`;
  } else {
    srsMsg = '次回: 明日（リセット）';
  }
  setText('srs-info', srsMsg);
  setText('explanation', q.exp);

  document.getElementById('answer-reveal')?.classList.remove('hidden');

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    const isLast = session.currentIndex === session.questions.length - 1;
    nextBtn.textContent = isLast ? '結果を見る →' : '次の問題へ →';
    nextBtn.classList.remove('hidden');
  }
}

function nextQuestion() {
  const { session } = App;
  if (session.currentIndex >= session.questions.length - 1) {
    showResult();
  } else {
    session.currentIndex++;
    renderQuestion();
  }
}

function showResult() {
  const { results } = App.session;
  const correct = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? correct / total : 0;

  setText('score-val', correct);
  setText('score-denom', `/ ${total}`);

  const ring = document.getElementById('score-ring');
  if (ring) {
    const circumference = 282.74;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - pct);
  }

  const catStats = {};
  results.forEach(r => {
    if (!catStats[r.category]) catStats[r.category] = { correct: 0, total: 0 };
    catStats[r.category].total++;
    if (r.correct) catStats[r.category].correct++;
  });

  const catEl = document.getElementById('cat-breakdown');
  if (catEl) {
    catEl.innerHTML = Object.entries(catStats).map(([cat, s]) => {
      const acc = Math.round(s.correct / s.total * 100);
      return `
        <div class="cat-row-result">
          <span class="cat-badge cat-${cat}">${CAT_NAMES[cat] || cat}</span>
          <div class="cat-bar-wrap">
            <div class="cat-bar-fill" style="width: ${acc}%"></div>
          </div>
          <span class="cat-score">${s.correct}/${s.total}</span>
        </div>
      `;
    }).join('');
  }

  // 80%以上の高スコアで紙吹雪 & ファンファーレ
  if (pct >= 0.8) {
    Sound.playFanfare();
    Confetti.fire();
  }

  showScreen('screen-result');
}

// Modal Helpers (Gemini)
function openModal(title, htmlContent) {
  setText('modal-title', title);
  document.getElementById('modal-content').innerHTML = htmlContent;
  document.getElementById('ai-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('ai-modal').classList.remove('active');
}

async function askAiExplanation() {
  const q = App.session.questions[App.session.currentIndex];
  const passageText = q.passageId && PASSAGE_BANK[q.passageId] ? PASSAGE_BANK[q.passageId].text : null;
  openModal('✨ Gemini AI 先生の深掘り解説', 'AI先生が解説を生成しています...');
  
  try {
    const exp = await Gemini.explainQuestion(q, null, passageText);
    openModal('✨ Gemini AI 先生の深掘り解説', `<div style="white-space:pre-wrap;">${exp}</div>`);
  } catch (err) {
    openModal('⚠️ エラー', `<p style="color:#ef4444;">${err.message}</p><p style="margin-top:10px; font-size:12px;">Gemini API キーを設定してください。</p>
    <input id="gemini-key-input" type="password" placeholder="Gemini API Key" style="width:100%; padding:8px; margin-top:8px;" />
    <button onclick="Gemini.setApiKey(document.getElementById('gemini-key-input').value); alert('APIキーを保存しました'); closeModal();" style="margin-top:8px; padding:6px 12px;">保存</button>`);
  }
}

function openGeminiKeySettingModal() {
  const currentKey = Gemini.getApiKey();
  const maskedKey = currentKey ? currentKey.substring(0, 6) + '...' + currentKey.substring(currentKey.length - 4) : '未設定';

  openModal('🔑 Gemini APIキー設定', `
    <p style="margin-bottom:10px;">Google AI Studio で取得した API キーを入力してください。（ブラウザ内だけに安全に保存されます）</p>
    <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">現在の状態: <strong style="color:var(--text);">${maskedKey}</strong></div>
    <input id="modal-gemini-key-input" type="password" placeholder="AIzaSy..." value="${currentKey}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:#060b14; color:#fff; font-size:14px; margin-bottom:12px;" />
    <button onclick="const k=document.getElementById('modal-gemini-key-input').value; Gemini.setApiKey(k); alert('APIキーを保存しました！'); closeModal();" style="width:100%; padding:12px; background:var(--blue); color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">保存する</button>
  `);
}

async function openGeminiGenModal() {
  const stats = getStats();
  const weakCat = stats.weakCat || 'pos';
  openModal('✨ AI問題自動生成', `
    <p>あなたの苦手カテゴリ [${CAT_NAMES[weakCat] || weakCat}] に合わせて、Gemini AI が新しい練習問題を生成します。</p>
    <button onclick="runAiQuestionGen('${weakCat}')" style="width:100%; padding:12px; margin-top:14px; background:var(--purple); color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">生成を開始</button>
  `);
}

async function runAiQuestionGen(cat) {
  openModal('✨ AI問題生成中...', 'Gemini が TOEIC 問題を作成しています。少々おまちください...');
  try {
    const newQs = await Gemini.generateQuestions(App.selectedPart == 'mix' ? 5 : App.selectedPart, cat, 3);
    if (newQs.length === 0) {
      openModal('⚠️ 生成失敗', '<p>有効な形式の問題が返ってきませんでした。もう一度お試しください。</p>');
      return;
    }
    newQs.forEach(q => QUESTION_BANK.push(q));
    saveGeneratedQuestions(newQs);
    renderHome();
    openModal('🎉 生成完了！', `<p>${newQs.length} 問を問題バンクに追加しました。次回以降も出題されます。</p>`);
  } catch (err) {
    openModal('⚠️ 生成失敗', `<p style="color:#ef4444;">${err.message}</p>`);
  }
}

async function openGeminiReportModal() {
  openModal('📊 AI 弱点分析レポート生成中', '学習履歴から Gemini がアドバイスを作成中...');
  try {
    const report = await Gemini.generateWeaknessReport(App.history, App.srsData);
    openModal('📊 AI 弱点分析レポート', `<div style="white-space:pre-wrap;">${report}</div>`);
  } catch (err) {
    openModal('⚠️ レポート生成失敗', `<p style="color:#ef4444;">${err.message}</p>`);
  }
}

function speakCurrentQuestion() {
  const { session } = App;
  if (!session || !session.questions[session.currentIndex]) return;
  const q = session.questions[session.currentIndex];
  
  let speechText = q.q ? q.q.replace('-------', 'blank') : '';
  if (q.passageId && PASSAGE_BANK[q.passageId]) {
    speechText = PASSAGE_BANK[q.passageId].text.replace(/\[\d+\]-------/g, 'blank') + '. ' + speechText;
  }
  TTS.speak(speechText);
}

function init() {
  loadData();
  try {
    const saved = localStorage.getItem('toeic_timer_enabled');
    if (saved !== null) App.timerEnabled = JSON.parse(saved);
    const script = localStorage.getItem('toeic_listening_script');
    if (script !== null) App.listeningShowScript = JSON.parse(script);
  } catch (_) { /* 既定値のまま */ }
  Sound.init();
  Auth.init();
  updateTimerToggleUI();
  updateListeningScriptUI();
  updateTtsRateUI();
  renderHome();
  showScreen('screen-home');

  document.getElementById('start-btn')?.addEventListener('click', startSession);
  document.getElementById('next-btn')?.addEventListener('click', nextQuestion);
  document.getElementById('home-btn')?.addEventListener('click', () => { stopTimer(); TTS.cancel(); renderHome(); showScreen('screen-home'); });
  document.getElementById('back-btn')?.addEventListener('click', () => { stopTimer(); TTS.cancel(); renderHome(); showScreen('screen-home'); });

  document.addEventListener('keydown', onKeyDown);
}

/**
 * キーボード操作
 *   1-4 / A-D : 選択肢を選ぶ
 *   Enter / Space : 次の問題へ
 *   R : リスニングをもう一度再生
 */
function onKeyDown(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;

  const quizVisible = document.getElementById('screen-quiz')?.classList.contains('active');
  if (!quizVisible) return;

  const key = e.key.toLowerCase();

  if (!App.session.answered) {
    let idx = -1;
    if (key >= '1' && key <= '4') idx = parseInt(key, 10) - 1;
    else if (['a', 'b', 'c', 'd'].includes(key)) idx = ['a', 'b', 'c', 'd'].indexOf(key);
    if (idx >= 0 && idx < (App.session.questions[App.session.currentIndex]?.shuffledChoices.length || 0)) {
      e.preventDefault();
      selectAnswer(idx);
      return;
    }
  }

  if (key === 'enter' || key === ' ') {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn && !nextBtn.classList.contains('hidden')) {
      e.preventDefault();
      nextQuestion();
    }
    return;
  }

  if (key === 'r') {
    const q = App.session.questions[App.session.currentIndex];
    if (q && q.part === 2) {
      e.preventDefault();
      playListening({ autoStart: false });
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
