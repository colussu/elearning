import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite DB
const db = new Database(path.join(process.cwd(), 'elearning.db'));
db.pragma('journal_mode = WAL');

// Initialize Schema & Run Migrations
function initDb() {
  // Step 1: Create or fix Members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'member',  -- system_admin, doc_admin, member
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Safe column injection for role in case members exists without it
  try {
    db.prepare('SELECT role FROM members LIMIT 1').get();
  } catch (err) {
    db.exec(`ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'member'`);
  }

  // Step 2: Create or fix Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('file', 'link')),
      url TEXT NOT NULL,
      uploader_student_id TEXT NOT NULL,
      group_name TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Safe column injection for group_name in case documents exists without it
  try {
    db.prepare('SELECT group_name FROM documents LIMIT 1').get();
  } catch (err) {
    db.exec(`ALTER TABLE documents ADD COLUMN group_name TEXT`);
  }

  // Seed default member if none exists
  const count = db.prepare('SELECT COUNT(*) as count FROM members').get();
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO members (student_id, name, password, role) VALUES (?, ?, ?, ?)');
    insert.run('1001', '王怡君', '123456', 'member');
    insert.run('1002', '謝東霖', '123456', 'member');
    insert.run('admin', '管理員', 'admin', 'system_admin');
    insert.run('docadmin', '教材管理員', 'docadmin', 'doc_admin');
    
    // Seed some sample documents
    const docInsert = db.prepare('INSERT INTO documents (title, category, type, url, uploader_student_id, group_name) VALUES (?, ?, ?, ?, ?, ?)');
    docInsert.run('JavaScript 基礎教學', '程式設計', 'link', 'https://developer.mozilla.org/zh-TW/docs/Web/JavaScript', 'admin', '基礎班');
    docInsert.run('專題報告範例', '通識課程', 'link', 'https://example.com/report', '1001', null);
  } else {
    // Make sure admin is a system_admin if migrating existing DB
    db.prepare("UPDATE members SET role = 'system_admin' WHERE student_id = 'admin'").run();
  }

  // Step 3: Create Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
  
  // Seed default categories if none exists
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const defaultCategories = ['程式設計', '語文', '數學', '通識課程', '專題報告', '其他'];
    for (const cat of defaultCategories) {
      try {
        insertCat.run(cat);
      } catch (err) {
        // Ignore duplicate
      }
    }
  }
}

initDb();

export default db;
