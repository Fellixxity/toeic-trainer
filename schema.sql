-- TOEIC Trainer — Supabase スキーマ
-- SQL Editor に貼り付けて実行する

-- SRS レコードテーブル
CREATE TABLE IF NOT EXISTS srs_records (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL,
  question_id      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'new',   -- new / learning / graduated
  interval         INTEGER NOT NULL DEFAULT 0,
  correct_streak   INTEGER NOT NULL DEFAULT 0,
  next_review      TIMESTAMPTZ,
  last_reviewed    TIMESTAMPTZ,
  attempts         INTEGER NOT NULL DEFAULT 0,
  correct_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 学習履歴テーブル
CREATE TABLE IF NOT EXISTS history (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL,
  question_id  TEXT NOT NULL,
  category     TEXT NOT NULL,
  correct      BOOLEAN NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER srs_records_updated_at
  BEFORE UPDATE ON srs_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE srs_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE history      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のレコードのみ操作可能" ON srs_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "自分の履歴のみ操作可能" ON history
  FOR ALL USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS srs_records_user_id_idx ON srs_records(user_id);
CREATE INDEX IF NOT EXISTS history_user_id_idx      ON history(user_id);
CREATE INDEX IF NOT EXISTS history_created_at_idx   ON history(created_at DESC);
