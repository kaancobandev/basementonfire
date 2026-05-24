CREATE TABLE hashtags (
  id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE  -- lowercase, no '#'
);

CREATE TABLE post_hashtags (
  post_id    BIGINT NOT NULL REFERENCES quick_facts(id) ON DELETE CASCADE,
  hashtag_id BIGINT NOT NULL REFERENCES hashtags(id)    ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);

-- Add 'mention' to the notifications type check
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('follow', 'comment', 'like', 'mention'));
