'use strict';

const CAT_NAMES = {
  pos:       '品詞',
  prep:      '前置詞・接続詞',
  gram:      '文法一般',
  gerund:    '前置詞+動名詞',
  colloc:    '語彙コロケーション',
  reading:   '長文読解',
  listening: 'リスニング応答',
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
const TIMER_BY_PART = { 2: 20, 5: 45, 6: 60, 7: 90 };
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

function loadData() {
  try {
    App.srsData = JSON.parse(localStorage.getItem('toeic_srs') || '{}');
    App.history = JSON.parse(localStorage.getItem('toeic_history') || '[]');
  } catch (_) {
    App.srsData = {};
    App.history = [];
  }
  loadGeneratedQuestions();
}

function saveData() {
  localStorage.setItem('toeic_srs', JSON.stringify(App.srsData));
  if (App.history.length > 500) App.history = App.history.slice(-500);
  localStorage.setItem('toeic_history', JSON.stringify(App.history));
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

function buildSession() {
  const { dueReviews, newQuestions } = getStats();

  let pool = shuffle([...dueReviews]).slice(0, 10);

  if (pool.length < 10 && newQuestions.length > 0) {
    const needed = 10 - pool.length;
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
    dueNote.textContent = stats.dueReviews.length > 10
      ? `うち10問を出題`
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
  const pred = Analytics.calculatePredictedScore(App.history, App.srsData, QUESTION_BANK.length);
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
    const dueCount = Math.min(stats.dueReviews.length, 10);
    const newCount = Math.min(10 - dueCount, stats.newQuestions.length);
    const parts = [];
    if (dueCount > 0) parts.push(`復習 ${dueCount}問`);
    if (newCount > 0) parts.push(`新規 ${newCount}問`);
    if (subLbl) subLbl.textContent = parts.join(' + ');
  }
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
    badge.textContent = `Part ${q.part} · ${CAT_NAMES[q.cat] || q.cat}`;
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
