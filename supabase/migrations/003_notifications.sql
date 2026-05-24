CREATE TABLE IF NOT EXISTS notifications (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('follow', 'comment', 'like')),
  post_id     BIGINT REFERENCES quick_facts(id) ON DELETE CASCADE,
  comment_id  BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Prevent duplicate like notifications per actor+post
CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_like_dedup
  ON notifications(user_id, actor_id, post_id)
  WHERE type = 'like';
