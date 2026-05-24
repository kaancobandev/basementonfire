CREATE TABLE IF NOT EXISTS conversations (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user1_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT conversations_ordered CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_u1 ON conversations(user1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_u2 ON conversations(user2_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id  BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content          TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv   ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_msg_unread ON messages(conversation_id, is_read) WHERE NOT is_read;
