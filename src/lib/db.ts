import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/basements.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT DEFAULT '/avatars/default.png',
      bio TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'general',
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quick_facts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      caption TEXT NOT NULL,
      media_url TEXT NOT NULL,
      media_type TEXT NOT NULL CHECK(media_type IN ('image','video')),
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Seed demo user if empty
    INSERT OR IGNORE INTO users (id, username, display_name, avatar, bio)
    VALUES (1, 'basement_admin', 'Basements', '/avatars/default.png', 'Bilim, tarih ve kültür içerikleri.');
  `);

  // Seed demo posts if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM posts').get() as { c: number }).c;
  if (count === 0) {
    db.exec(`
      INSERT INTO posts (user_id, content, image_url, category) VALUES
        (1, 'Kara delikler, uzayın en gizemli nesneleridir. Işık bile onlardan kaçamaz. 🕳️', NULL, 'science'),
        (1, 'Kartaca, Roma ile olan savaşlarıyla tarihe damgasını vurmuş muhteşem bir medeniyetti.', NULL, 'history'),
        (1, 'Büyük Yok Oluşlar: Dünya 5 kez büyük bir yok oluş yaşadı. Acaba 6.sında biz mi olacağız?', NULL, 'science'),
        (1, 'Roma İmparatorluğu''nun yükselişi ve çöküşü, tarihte eşi benzeri görülmemiş bir süreçtir.', NULL, 'history');
    `);
  }
}
