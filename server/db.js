const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'coats.db');
const db = new DatabaseSync(dbPath);

// Initialize Pragma
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_until INTEGER DEFAULT 0,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    role TEXT NOT NULL, -- 'SUPERVISORY' | 'CASE_HOLDING'
    branch TEXT NOT NULL, -- 'HQ' | 'CNI' | 'MDU' | 'CMB'
    unit TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT UNIQUE NOT NULL,
    ps_limit TEXT NOT NULL,
    crime_number TEXT NOT NULL,
    section_of_law TEXT NOT NULL,
    date_of_occurrence TEXT NOT NULL,
    date_of_registration TEXT NOT NULL,
    complainant_name TEXT NOT NULL,
    accused_details TEXT NOT NULL,
    gist_of_case TEXT NOT NULL,
    current_stage TEXT NOT NULL, -- 'Under Investigation' | 'Pending Trial' | 'Pending Before High Court' | 'Pending Before Supreme Court'
    case_holding_officer_id TEXT NOT NULL, -- username of officer
    case_holding_officer_name TEXT,
    branch TEXT NOT NULL, -- 'HQ' | 'CNI' | 'MDU' | 'CMB'
    date_of_first_updation TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    case_unique_id TEXT NOT NULL,
    task_description TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0, -- 0 = pending, 1 = completed
    completed_at TEXT,
    completed_by_officer TEXT,
    source_type TEXT DEFAULT 'INITIAL', -- 'INITIAL' | 'PROGRESS_UPDATE'
    progress_id INTEGER,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS progress_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    case_unique_id TEXT NOT NULL,
    officer_id TEXT NOT NULL,
    officer_name TEXT,
    progress_date TEXT NOT NULL,
    progress_details TEXT NOT NULL,
    reminder_date TEXT,
    further_action TEXT,
    remarks TEXT,
    stage_at_update TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
  );
`);

// ---- Security migrations (safe to run on every start) ----
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL, user_id TEXT, username TEXT,
    method TEXT, path TEXT, status INTEGER, ip TEXT
  );
`);
const userCols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
const legacyPlaintext = userCols.includes('plain_password');
if (legacyPlaintext) db.exec('ALTER TABLE users DROP COLUMN plain_password');
if (!userCols.includes('failed_attempts')) db.exec('ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0');
if (!userCols.includes('locked_until')) db.exec('ALTER TABLE users ADD COLUMN locked_until INTEGER DEFAULT 0');
if (legacyPlaintext) {
  // Old databases had plaintext + well-known shared passwords: rotate every account once.
  const file = require('./credentials').rotateAll(db);
  console.log('\n[SECURITY] Legacy credentials removed. New random passwords written to:\n  ' + file + '\n');
}

module.exports = db;
