'use strict';
/**
 * Supabase 認証 & クラウドデータ同期モジュール
 */
const Auth = {
  client: null,
  user: null,

  init() {
    if (typeof supabase === 'undefined' || !CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
      console.log('Supabase config not supplied or library missing. Operating in offline/localStorage mode.');
      this.updateUI();
      return;
    }

    try {
      this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      this.checkSession();
    } catch (e) {
      console.error('Supabase init failed:', e);
    }
  },

  async checkSession() {
    if (!this.client) return;
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
  },

  async loginWithGitHub() {
    if (!this.client) {
      alert('Supabase の設定 (config.js) がされていません。');
      return;
    }
    const { error } = await this.client.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.href }
    });
    if (error) alert('GitHub ログインエラー: ' + error.message);
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

  async syncDown() {
    if (!this.client || !this.user) return;
    try {
      const { data, error } = await this.client
        .from('srs_records')
        .select('*')
        .eq('user_id', this.user.id);
      
      if (error) throw error;
      if (data && data.length > 0) {
        data.forEach(item => {
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
        saveData();
        renderHome();
      }
    } catch (e) {
      console.error('Supabase syncDown error:', e);
    }
  }
};
