-- Likes tracking tables
CREATE TABLE IF NOT EXISTS post_likes (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS fact_likes (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fact_id BIGINT NOT NULL REFERENCES quick_facts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, fact_id)
);

-- Toggle like for posts (returns new count and liked state)
CREATE OR REPLACE FUNCTION toggle_post_like(p_user_id BIGINT, p_post_id BIGINT)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  already BOOLEAN;
  new_likes INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM post_likes WHERE user_id = p_user_id AND post_id = p_post_id) INTO already;

  IF already THEN
    DELETE FROM post_likes WHERE user_id = p_user_id AND post_id = p_post_id;
    UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = p_post_id RETURNING likes INTO new_likes;
  ELSE
    INSERT INTO post_likes (user_id, post_id) VALUES (p_user_id, p_post_id);
    UPDATE posts SET likes = likes + 1 WHERE id = p_post_id RETURNING likes INTO new_likes;
  END IF;

  RETURN json_build_object('likes', new_likes, 'liked', NOT already);
END;
$$;

-- Toggle like for quick_facts
CREATE OR REPLACE FUNCTION toggle_fact_like(p_user_id BIGINT, p_fact_id BIGINT)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  already BOOLEAN;
  new_likes INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM fact_likes WHERE user_id = p_user_id AND fact_id = p_fact_id) INTO already;

  IF already THEN
    DELETE FROM fact_likes WHERE user_id = p_user_id AND fact_id = p_fact_id;
    UPDATE quick_facts SET likes = GREATEST(likes - 1, 0) WHERE id = p_fact_id RETURNING likes INTO new_likes;
  ELSE
    INSERT INTO fact_likes (user_id, fact_id) VALUES (p_user_id, p_fact_id);
    UPDATE quick_facts SET likes = likes + 1 WHERE id = p_fact_id RETURNING likes INTO new_likes;
  END IF;

  RETURN json_build_object('likes', new_likes, 'liked', NOT already);
END;
$$;
