const express = require("express");
const router = express.Router();
const db = require("../db/database");

// API to serve user data
router.get("/data", async (req, res) => {
  try {
    const userId = req.query.userId || "anonymous";

    // Get user's mood history
    const moodHistory = await db.all(
      `SELECT mood, goal, language, time_stamp FROM mood_history 
       WHERE user_id = ? 
       ORDER BY time_stamp DESC 
       LIMIT 50`,
      [userId]
    );

    // Get mood statistics
    const moodStats = await db.all(
      `SELECT mood, COUNT(*) as count 
       FROM mood_history 
       WHERE user_id = ? 
       GROUP BY mood 
       ORDER BY count DESC`,
      [userId]
    );

    // Get recent activity
    const recentActivity = await db.all(
      `SELECT * FROM user_interactions 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        moodHistory,
        moodStats,
        recentActivity,
        totalEntries: moodHistory.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user data",
    });
  }
});

// Log user interactions (clicks, visits, etc.)
router.post("/log-interaction", async (req, res) => {
  try {
    const { userId = "anonymous", action, page, metadata = {} } = req.body;

    await db.run(
      `INSERT INTO user_interactions 
       (user_id, action, page, metadata, timestamp) 
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [userId, action, page, JSON.stringify(metadata)]
    );

    console.log(
      `📊 Logged interaction: ${action} on ${page} for user ${userId}`
    );

    res.json({
      success: true,
      message: "Interaction logged successfully",
    });
  } catch (error) {
    console.error("❌ Error logging interaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to log interaction",
    });
  }
});

// Get app statistics
router.get("/stats", async (req, res) => {
  try {
    // Total mood requests
    const totalRequests = await db.get(
      `SELECT COUNT(*) as count FROM mood_history`
    );

    // Unique users
    const uniqueUsers = await db.get(
      `SELECT COUNT(DISTINCT user_id) as count FROM mood_history`
    );

    // Most popular mood
    const popularMood = await db.get(
      `SELECT mood, COUNT(*) as count 
       FROM mood_history 
       GROUP BY mood 
       ORDER BY count DESC 
       LIMIT 1`
    );

    // Daily stats (last 7 days)
    const dailyStats = await db.all(
      `SELECT 
         date(time_stamp) as date,
         COUNT(*) as requests
       FROM mood_history 
       WHERE time_stamp >= datetime('now', '-7 days')
       GROUP BY date(time_stamp)
       ORDER BY date DESC`
    );

    res.json({
      success: true,
      stats: {
        totalRequests: totalRequests.count,
        uniqueUsers: uniqueUsers.count,
        popularMood: popularMood,
        dailyStats,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Mind Beats API",
  });
});

module.exports = router;
