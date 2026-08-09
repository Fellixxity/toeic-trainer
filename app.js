'use strict';

const CAT_NAMES = {
  pos:     '品詞',
  prep:    '前置詞・接続詞',
  gram:    '文法一般',
  gerund:  '前置詞+動名詞',
  colloc:  '語彙コロケーション',
  reading: '長文読解',
};

const TIMER_SECONDS = 45;
const TIMER_CIRCUMFERENCE = 138.23;

const App = {
  srsData: {},
  history: [],
  selectedPart: 5, // 5, 6, 7, 'mix'

  session: {
    questions: [],
    currentIndex: 0,
    answered: false,
    results: []
  },

  timer: {
    id: null,
    timeLeft: TIMER_SECONDS
  }
};

function loadData() {
  try {
    App.srsData = JSON.parse(localStorage.getItem('toeic_srs') || '{}');
    App.history = JSON.parse(localStorage.getItem('toeic_history') || '[]');
  } catch (_) {
    App.srsData = {};
    App.history = [];
  }
}

function saveData() {
  localStorage.setItem('toeic_srs', JSON.stringify(App.srsData));
  if (App.history.length > 500) App.history = App.history.slice(-500);
  localStorage.setItem('toeic_history', JSON.stringify(App.history));
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

  return pool.map(q => {
    const shuffledChoices = shuffle(
      q.choices.map((text, originalIndex) => ({ text, originalIndex }))
    );
    return { ...q, shuffledChoices };
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

function startTimer() {
  stopTimer();
  App.timer.timeLeft = TIMER_SECONDS;
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

  const pct = Math.max(0, t / TIMER_SECONDS);
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
  setText('accuracy-value', stats.accuracy !== null ? `${stats.accuracy}%` : '—');

  // Streak 計算 & 表示
  const streak = Analytics.calculateStreak(App.history);
  setText('streak-count', `🔥 ${streak}日`);

  const pct = stats.totalInPart > 0 ? Math.round(stats.graduated / stats.totalInPart * 100) : 0;
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${pct}%`;
  setText('progress-text', `${stats.graduated} / ${stats.totalInPart} 問 卒業済み`);

  // 過去7日間の成果グラフを描画
  const chartContainer = document.getElementById('chart-container');
  if (chartContainer) {
    const dailyStats = Analytics.getDailyStats(App.history, 7);
    chartContainer.innerHTML = Analytics.renderDailyChartSvg(dailyStats);
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

function startSession() {
  const questions = buildSession();
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

  // 問題文
  const qText = document.getElementById('question-card');
  if (qText) {
    qText.innerHTML = `<p class="q-text">${(q.q || '空所に最も適切な選択肢を選んでください。').replace('-------', '<span class="blank">_______</span>')}</p>`;
  }

  const LABELS = ['A', 'B', 'C', 'D'];
  const choicesEl = document.getElementById('choices');
  if (choicesEl) {
    choicesEl.innerHTML = q.shuffledChoices.map((c, i) => `
      <button class="choice-btn" id="choice-${i}" onclick="selectAnswer(${i})">
        <span class="choice-label">${LABELS[i]}</span>
        <span class="choice-text">${c.text}</span>
      </button>
    `).join('');
  }

  document.getElementById('answer-reveal')?.classList.add('hidden');
  document.getElementById('next-btn')?.classList.add('hidden');

  startTimer();
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

  const existing = App.srsData[q.id] || { status: 'new', interval: 0, correctStreak: 0, attempts: 0, correctCount: 0 };
  const updated = SRS.updateRecord(existing, isCorrect);
  App.srsData[q.id] = updated;

  App.history.push({
    questionId: q.id,
    correct: isCorrect,
    timestamp: new Date().toISOString(),
    category: q.cat
  });

  session.results.push({ questionId: q.id, correct: isCorrect, category: q.cat });

  saveData();
  Auth.syncUp(q.id, updated);
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
    newQs.forEach(q => QUESTION_BANK.push(q));
    renderHome();
    openModal('🎉 生成完了！', `<p>${newQs.length} 問の問題が新しく問題バンクに追加されました！</p>`);
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

function init() {
  loadData();
  Auth.init();
  renderHome();
  showScreen('screen-home');

  document.getElementById('start-btn')?.addEventListener('click', startSession);
  document.getElementById('next-btn')?.addEventListener('click', nextQuestion);
  document.getElementById('home-btn')?.addEventListener('click', () => { stopTimer(); renderHome(); showScreen('screen-home'); });
  document.getElementById('back-btn')?.addEventListener('click', () => { stopTimer(); renderHome(); showScreen('screen-home'); });
}

document.addEventListener('DOMContentLoaded', init);
