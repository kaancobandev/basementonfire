ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_private      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dm_privacy      TEXT    NOT NULL DEFAULT 'everyone'
    CHECK (dm_privacy IN ('everyone', 'followers', 'none')),
  ADD COLUMN IF NOT EXISTS comment_privacy TEXT    NOT NULL DEFAULT 'everyone'
    CHECK (comment_privacy IN ('everyone', 'followers', 'none'));
