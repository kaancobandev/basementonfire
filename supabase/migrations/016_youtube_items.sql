CREATE TABLE IF NOT EXISTS youtube_items (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type  TEXT NOT NULL CHECK (item_type IN ('video', 'playlist')),
  item_id    TEXT NOT NULL,
  title      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_youtube_items_user ON youtube_items(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_items_time ON youtube_items(created_at DESC);
