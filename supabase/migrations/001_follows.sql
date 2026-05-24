-- Supabase SQL Editor'de çalıştırın
-- Dashboard → SQL Editor → New query → Yapıştır → Run

CREATE TABLE IF NOT EXISTS follows (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
