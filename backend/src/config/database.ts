import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/character-tools.db';
const DATA_DIR = path.dirname(DATABASE_PATH);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create database connection
const db = new Database(DATABASE_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Characters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      personality TEXT,
      mes_example TEXT,
      scenario TEXT,
      first_mes TEXT,
      alternate_greetings TEXT,
      creator TEXT,
      creator_notes TEXT,
      character_version TEXT,
      tags TEXT,
      system_prompt TEXT,
      post_history_instructions TEXT,
      character_book_id TEXT,
      extensions TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_book_id) REFERENCES character_books(id) ON DELETE SET NULL
    )
  `);

  // Character Books table
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_books (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      scan_depth INTEGER,
      token_budget INTEGER,
      recursive_scanning INTEGER DEFAULT 0,
      extensions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Character Book Entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_book_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_book_id TEXT NOT NULL,
      name TEXT,
      comment TEXT,
      enabled INTEGER DEFAULT 1,
      case_sensitive INTEGER DEFAULT 0,
      selective INTEGER DEFAULT 0,
      constant INTEGER DEFAULT 0,
      position TEXT DEFAULT 'after_char',
      keys TEXT,
      secondary_keys TEXT,
      content TEXT,
      insertion_order INTEGER,
      priority INTEGER,
      extensions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_book_id) REFERENCES character_books(id) ON DELETE CASCADE
    )
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
    CREATE INDEX IF NOT EXISTS idx_characters_creator ON characters(creator);
    CREATE INDEX IF NOT EXISTS idx_character_books_name ON character_books(name);
    CREATE INDEX IF NOT EXISTS idx_character_book_entries_book_id ON character_book_entries(character_book_id);
  `);

  console.log('Database initialized successfully');
}

// Initialize database on import
initializeDatabase();

export default db;
