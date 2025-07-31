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

  // Create analytics_events table for detailed music analytics
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes separately
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp)`
  );

  // Create user_preferences table for recommendation improvements
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      mood TEXT,
      language TEXT,
      goal TEXT,
      play_count INTEGER DEFAULT 1,
      last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, mood, language, goal)
    )
  `);

  // Create playlist_engagement table
  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_engagement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      playlist_id TEXT,
      playlist_name TEXT,
      mood TEXT,
      goal TEXT,
      language TEXT,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
