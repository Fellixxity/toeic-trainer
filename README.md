# 📘 TOEIC Part 5/6/7 Trainer v2 (SRS + AI)

TOEIC Reading セクション（Part 5, Part 6, Part 7）を完全網羅した、間隔反復 (SRS) & Gemini AI 機能付き演習アプリです。

## 🌟 主な機能

- **Reading セクション全網羅 (Part 5 / 6 / 7 / Mix)**: 短文穴埋め、長文穴埋め、読解問題をカバー。
- **間隔反復 (SRS) アルゴリズム**: 正解数・間隔に応じて復習タイミングを最適自動管理。2連続正解＆8日以上で卒業。
- **PWA (Progressive Web App) 対応**: スマホ（iOS Safari / Android Chrome）のホーム画面に追加してアプリ感覚でオフライン動作可能。
- **Gemini AI 連携**:
  - 弱点カテゴリに合わせた **AI問題自動生成**
  - **AI先生の深掘り解説**（パッセージと回答を踏まえたマンツーマン解説）
  - 学習履歴から**AI弱点分析レポート**を生成
- **Supabase + GitHub OAuth ログイン**: スマホとPCで学習データを双方向同期。

---

## 🚀 動かし方

1. このリポジトリ/フォルダ内の `index.html` をブラウザで直接開くだけでローカル動作します。

---

## 📱 スマホ（PWA）での使い方

### iPhone / iPad (Safari)
1. Safari でデプロイ先の URL を開く
2. 画面下部の **共有ボタン (□↑)** をタップ
3. **「ホーム画面に追加」** を選択

### Android (Chrome)
1. Chrome で URL を開く
2. メニュー (⋮) から **「アプリをインストール」** または **「ホーム画面に追加」** を選択

---

## ☁️ Vercel デプロイ手順

1. GitHub にリポジトリを作成し、このフォルダのファイルをプッシュします。
2. [vercel.com](https://vercel.com) にログイン。
3. **Add New Project** で GitHub リポジトリを選択。
4. **Framework Preset** は `Other` のままで `Deploy` を押すだけ（ビルド不要の静的サイト）。

---

## 🔑 Gemini API 設定（AI機能）

1. [Google AI Studio](https://aistudio.google.com/) で無料の API キーを取得。
2. アプリ内の「AI問題生成」または「AI先生の深掘り解説」ボタンを押した際に出てくる入力ダイアログに API キーを入力して保存。
3. localStorage に安全に保存され、ブラウザからダイレクトに機能が利用可能になります。

---

## ⚡ Supabase + GitHub OAuth 連携設定（データ同期）

PCとスマホでデータを共有したい場合：

1. [supabase.com](https://supabase.com) で無料プロジェクトを作成。
2. **SQL Editor** でプロジェクト内の `schema.sql` を実行。
3. Supabase Dashboard の **Authentication > Providers > GitHub** を有効化。
4. [GitHub Developer Settings](https://github.com/settings/developers) で OAuth App を作成し、ClientID / ClientSecret を Supabase に登録。
5. `config.js` に `SUPABASE_URL` と `SUPABASE_ANON_KEY` を記入。
