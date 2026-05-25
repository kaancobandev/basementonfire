ALTER TABLE posts ADD COLUMN IF NOT EXISTS reposts INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS reposts (
  user_id    BIGINT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  post_id    BIGINT NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_reposts_post ON reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(user_id);

CREATE OR REPLACE FUNCTION toggle_post_repost(p_user_id BIGINT, p_post_id BIGINT)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE already BOOLEAN; new_count INT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM reposts WHERE user_id = p_user_id AND post_id = p_post_id
  ) INTO already;

  IF already THEN
    DELETE FROM reposts WHERE user_id = p_user_id AND post_id = p_post_id;
    UPDATE posts SET reposts = GREATEST(reposts - 1, 0) WHERE id = p_post_id RETURNING reposts INTO new_count;
  ELSE
    INSERT INTO reposts (user_id, post_id) VALUES (p_user_id, p_post_id);
    UPDATE posts SET reposts = reposts + 1 WHERE id = p_post_id RETURNING reposts INTO new_count;
  END IF;

  RETURN json_build_object('reposted', NOT already, 'reposts', new_count);
END;
$$;
