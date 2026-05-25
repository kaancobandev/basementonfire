ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birthdate DATE,
  ADD COLUMN IF NOT EXISTS location  TEXT,
  ADD COLUMN IF NOT EXISTS website   TEXT,
  ADD COLUMN IF NOT EXISTS gender    TEXT NOT NULL DEFAULT ''
    CHECK (gender IN ('', 'erkek', 'kadin', 'diger')),
  ADD COLUMN IF NOT EXISTS interests TEXT[] NOT NULL DEFAULT '{}';
