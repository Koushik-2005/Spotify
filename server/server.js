require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db/database");
const verifyToken = require("./middleware/authMiddleware");

const app = express();

// --------------------- Middleware ---------------------
app.use(cors());
app.use(express.json());

// View engine (for server-rendered analytics page)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------------------- Routes ---------------------
const journalRoutes = require("./routes/journalRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api", journalRoutes);
app.use("/api", playlistRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);

// --------------------- Analytics Route (EJS) ---------------------
app.get("/analytics", verifyToken, async (req, res) => {
  const filter = req.query.range || "all";
  const userId = req.user.id;

  let dateCondition = "";
  const params = [userId];

  if (filter === "today") {
    dateCondition = `AND date(time_stamp) = date('now')`;
  } else if (filter === "week") {
    dateCondition = `AND time_stamp >= datetime('now', '-7 days')`;
  } else if (filter === "month") {
    dateCondition = `AND strftime('%Y-%m', time_stamp) = strftime('%Y-%m', 'now')`;
  }

  try {
    const moods = await db.all(
      `SELECT mood, COUNT(*) as count FROM mood_history WHERE user_id = ? ${dateCondition} GROUP BY mood`,
      params
    );

    const goals = await db.all(
      `SELECT goal, COUNT(*) as count FROM mood_history WHERE user_id = ? ${dateCondition} GROUP BY goal`,
      params
    );

    const languages = await db.all(
      `SELECT language, COUNT(*) as count FROM mood_history WHERE user_id = ? ${dateCondition} GROUP BY language`,
      params
    );

    console.log("✅ Filtered analytics fetched for:", userId, filter);

    res.render("analytics", {
      moods,
      goals,
      languages,
      filter,
    });
  } catch (err) {
    console.error("🔥 Error loading analytics:", err);
    res.status(500).send("Error loading analytics");
  }
});

// --------------------- Optional: JSON Analytics API ---------------------
app.get("/api/analytics-json", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const filter = req.query.range || "all";
  let dateCondition = "";
  const params = [userId];

  if (filter === "today") {
    dateCondition = `AND date(time_stamp) = date('now')`;
  } else if (filter === "week") {
    dateCondition = `AND time_stamp >= datetime('now', '-7 days')`;
  } else if (filter === "month") {
    dateCondition = `AND strftime('%Y-%m', time_stamp) = strftime('%Y-%m', 'now')`;
  }

  try {
    const moods = await db.all(
      `SELECT mood, COUNT(*) as count FROM mood_history WHERE user_id = ? ${dateCondition} GROUP BY mood`,
      params
    );
    const goals = await db.all(
      `SELECT goal, COUNT(*) as count FROM mood_history WHERE user_id = ? ${dateCondition} GROUP BY goal`,
      params
    );
    const languages = await db.all(
      `SELECT language, COUNT(*) as count FROM mood_history WHERE user_id = ? ${dateCondition} GROUP BY language`,
      params
    );

    res.json({ moods, goals, languages });
  } catch (err) {
    console.error("🔥 Error loading analytics:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

app.get("/api/analytics-json", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const moods = await db.all(
      `SELECT mood, COUNT(*) as count FROM mood_history WHERE user_id = ? GROUP BY mood`,
      [userId]
    );

    const goals = await db.all(
      `SELECT goal, COUNT(*) as count FROM mood_history WHERE user_id = ? GROUP BY goal`,
      [userId]
    );

    const languages = await db.all(
      `SELECT language, COUNT(*) as count FROM mood_history WHERE user_id = ? GROUP BY language`,
      [userId]
    );

    res.json({ moods, goals, languages });
  } catch (err) {
    console.error("Error loading analytics JSON:", err);
    res.status(500).json({ error: "Failed to load analytics data" });
  }
});

// --------------------- Test Route ---------------------
app.get("/test-db", async (req, res) => {
  try {
    const rows = await db.all(
      `SELECT id, mood, goal, language, datetime(time_stamp) as time FROM mood_history ORDER BY id DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ DB test error:", err.message);
    res.status(500).send("DB error");
  }
});

// --------------------- Root ---------------------
app.get("/", (req, res) => {
  res.send("Mind Beats backend is running 🎧");
});

// --------------------- Start Server ---------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
