const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "moodify.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

// Auto-create the mood_history table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS mood_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      mood TEXT,
      goal TEXT,
      language TEXT,
      time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user_interactions table for logging user activities
  db.run(`
    CREATE TABLE IF NOT EXISTS user_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      page TEXT,
      metadata TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Database tables initialized");
});

module.exports = {
  run: (...args) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(...args, function (err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    }),

  all: (...args) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(...args, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }),

  get: (...args) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(...args, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }),
};
