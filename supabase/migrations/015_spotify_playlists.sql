CREATE TABLE IF NOT EXISTS spotify_playlists (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  playlist_id  TEXT NOT NULL,
  title        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, playlist_id)
);

CREATE INDEX IF NOT EXISTS idx_spotify_playlists_user ON spotify_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_playlists_time ON spotify_playlists(created_at DESC);
