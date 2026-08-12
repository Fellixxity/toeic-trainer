'use strict';
/**
 * Supabase 認証 & クラウドデータ同期モジュール
 */
const Auth = {
  client: null,
  user: null,

  async init() {
    // CDNスクリプトのロード待機 (最大3秒)
    let retries = 0;
    while (typeof supabase === 'undefined' && retries < 30) {
      await new Promise(r => setTimeout(r, 100));
      retries++;
    }

    if (typeof supabase === 'undefined') {
      console.warn('Supabase JS SDK の読み込みに失敗しました。オフラインモードで動作します。');
      this.updateUI();
      return;
    }

    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
      console.warn('Supabase URL または KEY が未設定です。');
      this.updateUI();
      return;
    }

    try {
      this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      await this.checkSession();
    } catch (e) {
      console.error('Supabase init failed:', e);
    }
  },

  async checkSession() {
    if (!this.client) return;
    try {
      const { data: { session } } = await this.client.auth.getSession();
      if (session) {
        this.user = session.user;
        this.updateUI();
        await this.syncDown();
      }

      this.client.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          this.user = session.user;
          this.updateUI();
          await this.syncDown();
        } else {
          this.user = null;
          this.updateUI();
        }
      });
    } catch (err) {
      console.error('Session check error:', err);
    }
  },

  async loginWithGitHub() {
    if (!this.client) {
      // client が null の場合に原因を親切にポップアップ表示
      if (typeof supabase === 'undefined') {
        alert('Supabase ライブラリの読み込み中です。数秒待ってから再試行してください。');
      } else if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
        alert('config.js の SUPABASE_URL / ANON_KEY が設定されていません。');
      } else {
        try {
          this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        } catch (e) {
          alert('Supabase クライアント初期化エラー: ' + e.message);
          return;
        }
      }
    }

    if (!this.client) return;

    try {
      const { error } = await this.client.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) alert('GitHub ログインエラー: ' + error.message);
    } catch (e) {
      alert('ログイン処理エラー: ' + e.message);
    }
  },

  async logout() {
    if (!this.client) return;
    await this.client.auth.signOut();
    this.user = null;
    this.updateUI();
  },

  updateUI() {
    const userContainer = document.getElementById('user-auth-area');
    if (!userContainer) return;

    if (this.user) {
      userContainer.innerHTML = `
        <div class="user-badge">
          <img class="user-avatar" src="${this.user.user_metadata?.avatar_url || 'https://github.com/identicons/app.png'}" alt="Avatar" />
          <span class="user-name">${this.user.user_metadata?.full_name || this.user.email || 'ユーザー'}</span>
          <button class="btn-logout" onclick="Auth.logout()">ログアウト</button>
        </div>
      `;
    } else {
      userContainer.innerHTML = `
        <button class="btn-github-login" onclick="Auth.loginWithGitHub()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHubで同期・ログイン
        </button>
      `;
    }
  },

  async syncUp(questionId, record) {
    if (!this.client || !this.user) return;
    try {
      await this.client.from('srs_records').upsert({
        user_id: this.user.id,
        question_id: questionId,
        status: record.status,
        interval: record.interval,
        correct_streak: record.correctStreak,
        next_review: record.nextReview,
        last_reviewed: record.lastReviewed,
        attempts: record.attempts,
        correct_count: record.correctCount
      }, { onConflict: 'user_id,question_id' });
    } catch (e) {
      console.error('Supabase syncUp error:', e);
    }
  },

  /**
   * 解答履歴を1件クラウドへ送る
   * （グラフ・連続日数・学習時間・予想スコアは全て履歴から計算されるため、
   *   これを送らないと SRS だけ同期されて分析結果が端末ごとにバラバラになる）
   */
  async syncHistoryUp(entry) {
    if (!this.client || !this.user) return;
    const base = {
      user_id: this.user.id,
      question_id: entry.questionId,
      category: entry.category,
      correct: entry.correct,
      created_at: entry.timestamp
    };
    try {
      // duration_sec 列は後から追加した任意項目。まだ列が無いプロジェクトでも
      // 履歴同期そのものが止まらないよう、失敗したら列なしで入れ直す。
      const { error } = await this.client
        .from('history')
        .insert({ ...base, duration_sec: entry.durationSec });
      if (error) {
        await this.client.from('history').insert(base);
      }
    } catch (e) {
      console.error('Supabase history insert error:', e);
    }
  },

  /**
   * ローカルにしかない SRS レコードをまとめてクラウドへ上げる
   * （未ログイン・オフラインで解いた分は syncUp が素通りするため、
   *   ログイン時にここで拾わないと永久にクラウドへ届かない）
   */
  async pushLocalRecords(cloudIds) {
    if (!this.client || !this.user) return;
    const rows = Object.entries(App.srsData)
      .filter(([qid]) => !cloudIds.has(qid))
      .map(([qid, r]) => ({
        user_id: this.user.id,
        question_id: qid,
        status: r.status,
        interval: r.interval,
        correct_streak: r.correctStreak,
        next_review: r.nextReview,
        last_reviewed: r.lastReviewed,
        attempts: r.attempts,
        correct_count: r.correctCount
      }));
    if (rows.length === 0) return;
    try {
      await this.client.from('srs_records').upsert(rows, { onConflict: 'user_id,question_id' });
    } catch (e) {
      console.error('Supabase bulk push error:', e);
    }
  },

  /**
   * 指定した問題IDのSRSレコードをクラウドから削除する
   * （消してもローカルだけだと次回同期で復活してしまうため）
   */
  async deleteSrsRecords(questionIds) {
    if (!this.client || !this.user || questionIds.length === 0) return 0;
    try {
      const { error } = await this.client
        .from('srs_records')
        .delete()
        .eq('user_id', this.user.id)
        .in('question_id', questionIds);
      if (error) throw error;
      return questionIds.length;
    } catch (e) {
      console.error('Supabase srs delete error:', e);
      return 0;
    }
  },

  async syncDown() {
    if (!this.client || !this.user) return;
    try {
      const { data, error } = await this.client
        .from('srs_records')
        .select('*')
        .eq('user_id', this.user.id);

      if (error) throw error;

      const cloudIds = new Set();
      if (data && data.length > 0) {
        data.forEach(item => {
          cloudIds.add(item.question_id);
          const local = App.srsData[item.question_id];
          const cloudSeen = new Date(item.last_reviewed || 0).getTime();
          const localSeen = new Date(local?.lastReviewed || 0).getTime();
          // 新しく解いた方を採用する（クラウドで無条件上書きすると
          // 別端末で進めた分が巻き戻る）
          if (local && localSeen > cloudSeen) return;

          App.srsData[item.question_id] = {
            status: item.status,
            interval: item.interval,
            correctStreak: item.correct_streak,
            nextReview: item.next_review,
            lastReviewed: item.last_reviewed,
            attempts: item.attempts,
            correctCount: item.correct_count
          };
        });
      }

      await this.syncHistoryDown();
      await this.pushLocalRecords(cloudIds);

      saveData();
      renderHome();
    } catch (e) {
      console.error('Supabase syncDown error:', e);
    }
  },

  async syncHistoryDown() {
    if (!this.client || !this.user) return;
    try {
      const { data, error } = await this.client
        .from('history')
        .select('*')
        .eq('user_id', this.user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      if (!data) return;

      const merged = new Map(App.history.map(h => [historyKey(h), h]));
      data.forEach(item => {
        const entry = {
          questionId: item.question_id,
          correct: item.correct,
          // 端末側と同じ形式に正規化してから保持する。
          // DBは "…+00:00"、端末は "…Z" を返すため、生の文字列のままだと
          // 同じ解答を別物とみなして二重登録してしまう。
          timestamp: new Date(item.created_at).toISOString(),
          category: item.category,
          durationSec: item.duration_sec || 15
        };
        const k = historyKey(entry);
        if (!merged.has(k)) merged.set(k, entry);
      });

      App.history = [...merged.values()]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-500);
    } catch (e) {
      console.error('Supabase history fetch error:', e);
    }
  }
};
