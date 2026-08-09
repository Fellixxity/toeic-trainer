'use strict';
/**
 * SRS (Spaced Repetition System) アルゴリズム
 *
 * 間隔の進み方（正解ごとに2倍）:
 *   new → 1日 → 2日 → 4日 → 8日 → 卒業
 *
 * 卒業条件: 2連続正解 かつ interval >= 8
 * 不正解時: interval = 1, correctStreak = 0, 翌日に再出題
 */
const SRS = {
  /**
   * 今日0時のDateを返す（比較用）
   */
  today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * date に days 日加算して返す
   * @param {Date} date
   * @param {number} days
   * @returns {Date}
   */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * 問題が今日出題対象かを返す
   * @param {object|null} record
   * @returns {boolean}
   */
  isDue(record) {
    if (!record || record.status === 'new' || record.status === 'graduated') return false;
    if (!record.nextReview) return true;
    return new Date(record.nextReview) <= this.today();
  },

  /**
   * 回答後にレコードを更新する
   * @param {object} record  既存レコード（なければ {} を渡す）
   * @param {boolean} wasCorrect
   * @returns {object} 更新済みレコード
   */
  updateRecord(record, wasCorrect) {
    const todayMidnight = this.today();
    const base = {
      attempts:     (record.attempts     || 0) + 1,
      correctCount: (record.correctCount || 0) + (wasCorrect ? 1 : 0),
      lastReviewed: new Date().toISOString(),
    };

    if (!wasCorrect) {
      return {
        ...record,
        ...base,
        status:        'learning',
        interval:      1,
        correctStreak: 0,
        nextReview:    this.addDays(todayMidnight, 1).toISOString(),
      };
    }

    // 正解
    const currentInterval = record.interval || 0;
    const newInterval     = currentInterval === 0 ? 1 : currentInterval * 2;
    const newStreak       = (record.correctStreak || 0) + 1;
    const graduated       = newStreak >= 2 && newInterval >= 8;

    return {
      ...record,
      ...base,
      status:        graduated ? 'graduated' : 'learning',
      interval:      newInterval,
      correctStreak: newStreak,
      nextReview:    graduated ? null : this.addDays(todayMidnight, newInterval).toISOString(),
    };
  },

  /**
   * 次回出題日を人間向けのテキストで返す
   * @param {object} record
   * @returns {string}
   */
  nextReviewLabel(record) {
    if (!record || record.status === 'new')       return '未挑戦';
    if (record.status === 'graduated')            return '🎓 卒業済み';
    if (!record.nextReview)                       return '—';
    const diff = Math.ceil(
      (new Date(record.nextReview) - this.today()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 0) return '今日';
    if (diff === 1) return '明日';
    return `${diff}日後`;
  },
};
