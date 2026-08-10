'use strict';
/**
 * 学習アナリティクス & SVG グラフ描画モジュール
 */
const Analytics = {
  /**
   * ローカルタイムゾーン基準の YYYY-MM-DD を返す
   *
   * toISOString() は UTC に変換されるため、JST(+9) では
   * 朝9時より前の学習が「前日」に集計されてしまう。
   * 日付の集計は必ずこのヘルパーを通すこと（srs.js のローカル日付基準と揃える）。
   */
  dateKey(dateLike) {
    const d = dateLike ? new Date(dateLike) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /**
   * 学習時間の集計 (今日の時間・累計時間)
   */
  getStudyTimeStats(history) {
    if (!history || history.length === 0) {
      return { todaySec: 0, totalSec: 0, todayFormatted: '0分', totalFormatted: '0分' };
    }

    const todayStr = this.dateKey();
    let todaySec = 0;
    let totalSec = 0;

    history.forEach(h => {
      const duration = h.durationSec || 15;
      totalSec += duration;

      const dateStr = this.dateKey(h.timestamp);
      if (dateStr === todayStr) {
        todaySec += duration;
      }
    });

    return {
      todaySec,
      totalSec,
      todayFormatted: this.formatDuration(todaySec),
      totalFormatted: this.formatDuration(totalSec)
    };
  },

  formatDuration(seconds) {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return secs > 0 ? `${mins}分${secs}秒` : `${mins}分`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours}時間${remMins}分` : `${hours}時間`;
  },

  /**
   * TOEIC Reading 予想スコア (100点 〜 495点) を算出
   */
  calculatePredictedScore(history, srsData, totalQuestionsCount) {
    if (!history || history.length < 5) {
      return { score: 120, rank: '測定中...', detail: '過去の回答データが5件未満です' };
    }

    const recent = history.slice(-30);
    const accuracyRatio = recent.filter(h => h.correct).length / recent.length;

    const graduatedCount = Object.values(srsData).filter(r => r.status === 'graduated').length;
    const graduatedRatio = Math.min(1, graduatedCount / (totalQuestionsCount || 44));

    let score = 100 + Math.round(accuracyRatio * 270) + Math.round(graduatedRatio * 125);
    score = Math.min(495, Math.max(100, Math.round(score / 5) * 5));

    let rank = '初級 Challenger';
    if (score >= 420) rank = '👑 900+ マスター級';
    else if (score >= 360) rank = '🔥 800+ エキスパート';
    else if (score >= 300) rank = '✨ 700+ アチーバー';
    else if (score >= 230) rank = '📘 600+ スタンダード';

    return { score, rank, accuracyRatio: Math.round(accuracyRatio * 100) };
  },

  getPastDays(daysCount = 7) {
    const days = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const dateStr = this.dateKey(d);
      days.push({ label, dateStr });
    }
    return days;
  },

  calculateStreak(history) {
    if (!history || history.length === 0) return 0;
    
    const dates = new Set(
      history.map(h => this.dateKey(h.timestamp))
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = this.dateKey(d);
      if (dates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  getDailyStats(history, daysCount = 7) {
    const days = this.getPastDays(daysCount);
    const dayMap = {};
    days.forEach(d => {
      dayMap[d.dateStr] = { label: d.label, total: 0, correct: 0, durationSec: 0 };
    });

    history.forEach(h => {
      const dateStr = this.dateKey(h.timestamp);
      if (dayMap[dateStr]) {
        dayMap[dateStr].total++;
        dayMap[dateStr].durationSec += (h.durationSec || 15);
        if (h.correct) dayMap[dateStr].correct++;
      }
    });

    return Object.values(dayMap).map(d => ({
      ...d,
      accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
    }));
  },

  /**
   * カテゴリ別の習熟度を集計する
   * accuracy は直近の実力を見るため最新20件まで、mastery は卒業率。
   */
  getCategoryMastery(history, srsData, questionBank, catNames) {
    const stats = {};
    questionBank.forEach(q => {
      const s = stats[q.cat] || (stats[q.cat] = {
        cat: q.cat, label: catNames[q.cat] || q.cat,
        total: 0, graduated: 0, attempted: 0, correct: 0, recent: []
      });
      s.total++;
      const r = srsData[q.id];
      if (r && r.status === 'graduated') s.graduated++;
      if (r && r.status && r.status !== 'new') s.attempted++;
    });

    history.forEach(h => {
      const s = stats[h.category];
      if (!s) return;
      s.recent.push(h.correct);
    });

    return Object.values(stats).map(s => {
      const recent = s.recent.slice(-20);
      return {
        cat: s.cat,
        label: s.label,
        total: s.total,
        graduated: s.graduated,
        attempted: s.attempted,
        answered: recent.length,
        accuracy: recent.length ? Math.round(recent.filter(Boolean).length / recent.length * 100) : null,
        mastery: s.total ? Math.round(s.graduated / s.total * 100) : 0
      };
    }).sort((a, b) => {
      // 正答率が低い順。未着手は最後にまわす
      if (a.accuracy === null && b.accuracy === null) return 0;
      if (a.accuracy === null) return 1;
      if (b.accuracy === null) return -1;
      return a.accuracy - b.accuracy;
    });
  },

  /**
   * 今後7日間に何問復習が来るかの見通し
   */
  getReviewForecast(srsData, questionBank, daysCount = 7) {
    const days = this.getPastDays(1).slice(0, 0); // 型合わせ用（未使用）
    const buckets = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      buckets.push({ label: i === 0 ? '今日' : `${d.getMonth() + 1}/${d.getDate()}`, dateStr: this.dateKey(d), count: 0 });
    }
    const map = {};
    buckets.forEach(b => { map[b.dateStr] = b; });
    const todayKey = this.dateKey();

    questionBank.forEach(q => {
      const r = srsData[q.id];
      if (!r || r.status === 'new' || r.status === 'graduated' || !r.nextReview) return;
      const key = this.dateKey(r.nextReview);
      if (key <= todayKey) { buckets[0].count++; return; }  // 期限切れは今日にまとめる
      if (map[key]) map[key].count++;
    });
    return buckets;
  },

  renderDailyChartSvg(dailyStats) {
    const width = 320;
    const height = 160;
    const padding = 28;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxCount = Math.max(...dailyStats.map(d => d.total), 10);
    const barWidth = 14;

    const points = [];
    let barsHtml = '';

    dailyStats.forEach((d, i) => {
      const x = padding + (chartW / (dailyStats.length - 1 || 1)) * i;
      
      const barH = (d.total / maxCount) * chartH;
      const barY = height - padding - barH;
      barsHtml += `
        <rect x="${x - barWidth / 2}" y="${barY}" width="${barWidth}" height="${barH}" rx="3" fill="rgba(59, 130, 246, 0.35)" stroke="#3b82f6" stroke-width="1"/>
        <text x="${x}" y="${height - 8}" font-size="9" fill="#94a3b8" text-anchor="middle">${d.label}</text>
      `;

      const accY = height - padding - (d.accuracy / 100) * chartH;
      points.push({ x, y: accY, acc: d.accuracy });
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    let dotsHtml = '';
    points.forEach(p => {
      dotsHtml += `
        <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
        ${p.acc > 0 ? `<text x="${p.x}" y="${p.y - 7}" font-size="8.5" font-weight="700" fill="#c084fc" text-anchor="middle">${p.acc}%</text>` : ''}
      `;
    });

    return `
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; overflow:visible;">
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
        <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)"/>
        ${barsHtml}
        <path d="${linePath}" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${dotsHtml}
      </svg>
    `;
  }
};
