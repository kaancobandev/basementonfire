CREATE TABLE IF NOT EXISTS polls (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id  BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poll_id  BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text     TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 80),
  votes    INT  NOT NULL DEFAULT 0,
  position INT  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  user_id   BIGINT NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  poll_id   BIGINT NOT NULL REFERENCES polls(id)         ON DELETE CASCADE,
  option_id BIGINT NOT NULL REFERENCES poll_options(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, poll_id)
);

CREATE INDEX IF NOT EXISTS idx_polls_post       ON polls(post_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll   ON poll_votes(poll_id);

-- Atomik oy kullanma fonksiyonu
CREATE OR REPLACE FUNCTION cast_poll_vote(
  p_user_id  BIGINT,
  p_poll_id  BIGINT,
  p_option_id BIGINT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE result JSONB;
BEGIN
  IF EXISTS (
    SELECT 1 FROM poll_votes WHERE user_id = p_user_id AND poll_id = p_poll_id
  ) THEN
    RETURN jsonb_build_object('error', 'already_voted');
  END IF;

  INSERT INTO poll_votes (user_id, poll_id, option_id)
    VALUES (p_user_id, p_poll_id, p_option_id);

  UPDATE poll_options SET votes = votes + 1 WHERE id = p_option_id;

  SELECT jsonb_build_object(
    'options', jsonb_agg(
      jsonb_build_object('id', id, 'text', text, 'votes', votes, 'position', position)
      ORDER BY position
    ),
    'total_votes', SUM(votes)
  )
  INTO result
  FROM poll_options
  WHERE poll_id = p_poll_id;

  RETURN result;
END;
$$;
