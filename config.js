/**
 * Supabase 接続設定（任意）
 *
 * localStorageだけで動かす場合は何も変更不要。
 * PC・スマホで学習データを共有したい場合のみ以下を記入する。
 *
 * 設定手順:
 *   1. https://supabase.com で無料プロジェクト作成
 *   2. SQL Editor で schema.sql を実行
 *   3. 下記の SUPABASE_URL と SUPABASE_ANON_KEY を記入
 *   4. index.html の <head> に以下を追加:
 *      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */
const CONFIG = {
  SUPABASE_URL: '',       // 例: 'https://xxxxxxxxxxxx.supabase.co'
  SUPABASE_ANON_KEY: '',  // 例: 'eyJhbGci...'
};
