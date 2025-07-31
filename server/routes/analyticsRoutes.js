const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Track individual analytics event
router.post("/track", async (req, res) => {
  try {
    const { eventType, userId, sessionId, timestamp, data } = req.body;

    // Insert the analytics event
    await db.run(
      `
      INSERT INTO analytics_events 
      (user_id, session_id, event_type, event_data, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `,
      [userId, sessionId, eventType, JSON.stringify(data), timestamp]
    );

    // Handle specific event types for additional processing
    if (eventType === "song_play") {
      await handleSongPlayEvent(data, userId);
    } else if (eventType === "playlist_open") {
      await handlePlaylistOpenEvent(data, userId);
    }

    console.log(`🎵 Analytics tracked: ${eventType} for user ${userId}`);
    res.json({ success: true, message: "Event tracked successfully" });
  } catch (error) {
    console.error("❌ Error tracking analytics event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to track event",
    });
  }
});

// Batch track multiple events
router.post("/batch", async (req, res) => {
  try {
    const { events, userId } = req.body;

    for (const event of events) {
      await db.run(
        `
        INSERT INTO analytics_events 
        (user_id, session_id, event_type, event_data, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          event.userId,
          event.sessionId,
          event.eventType,
          JSON.stringify(event.data),
          event.timestamp,
        ]
      );
    }

    console.log(
      `🎵 Batch analytics tracked: ${events.length} events for user ${userId}`
    );
    res.json({
      success: true,
      message: `${events.length} events tracked successfully`,
    });
  } catch (error) {
    console.error("❌ Error batch tracking events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to batch track events",
    });
  }
});

// Get user listening statistics
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const timeframe = req.query.timeframe || "7d";

    const timeCondition = getTimeCondition(timeframe);

    // Total listening time
    const listeningTime = await db.get(
      `
      SELECT 
        SUM(CAST(json_extract(event_data, '$.listenDuration') AS INTEGER)) as total_time
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type IN ('song_pause', 'song_complete', 'song_skip')
        ${timeCondition}
    `,
      [userId]
    );

    // Song plays count
    const songPlays = await db.get(
      `
      SELECT COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type = 'song_play'
        ${timeCondition}
    `,
      [userId]
    );

    // Completed songs
    const completedSongs = await db.get(
      `
      SELECT COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type = 'song_complete'
        ${timeCondition}
    `,
      [userId]
    );

    // Skip rate
    const skippedSongs = await db.get(
      `
      SELECT COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type = 'song_skip'
        ${timeCondition}
    `,
      [userId]
    );

    // Top moods
    const topMoods = await db.all(
      `
      SELECT 
        json_extract(event_data, '$.mood') as mood,
        COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type = 'song_play'
        AND json_extract(event_data, '$.mood') IS NOT NULL
        ${timeCondition}
      GROUP BY mood
      ORDER BY count DESC
      LIMIT 5
    `,
      [userId]
    );

    // Listening patterns by hour
    const hourlyPattern = await db.all(
      `
      SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type = 'song_play'
        ${timeCondition}
      GROUP BY hour
      ORDER BY hour
    `,
      [userId]
    );

    const stats = {
      totalListeningTime: listeningTime.total_time || 0,
      songPlays: songPlays.count || 0,
      completedSongs: completedSongs.count || 0,
      skippedSongs: skippedSongs.count || 0,
      skipRate:
        songPlays.count > 0
          ? ((skippedSongs.count / songPlays.count) * 100).toFixed(1)
          : 0,
      completionRate:
        songPlays.count > 0
          ? ((completedSongs.count / songPlays.count) * 100).toFixed(1)
          : 0,
      topMoods,
      hourlyPattern,
      timeframe,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("❌ Error fetching listening stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

// Get mood trends for a user
router.get("/mood-trends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const timeframe = req.query.timeframe || "7d";

    const timeCondition = getTimeCondition(timeframe);

    const moodTrends = await db.all(
      `
      SELECT 
        date(timestamp) as date,
        json_extract(event_data, '$.mood') as mood,
        COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? 
        AND event_type = 'song_play'
        AND json_extract(event_data, '$.mood') IS NOT NULL
        ${timeCondition}
      GROUP BY date, mood
      ORDER BY date DESC, count DESC
    `,
      [userId]
    );

    // Group by date for easier frontend consumption
    const trendsByDate = {};
    moodTrends.forEach((trend) => {
      if (!trendsByDate[trend.date]) {
        trendsByDate[trend.date] = [];
      }
      trendsByDate[trend.date].push({
        mood: trend.mood,
        count: trend.count,
      });
    });

    res.json({
      success: true,
      trends: trendsByDate,
      timeframe,
    });
  } catch (error) {
    console.error("❌ Error fetching mood trends:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch mood trends",
    });
  }
});

// Get global app analytics (for admin/insights)
router.get("/global-stats", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "30d";
    const timeCondition = getTimeCondition(timeframe);

    const globalStats = await db.all(`
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM analytics_events 
      WHERE 1=1 ${timeCondition}
      GROUP BY event_type
      ORDER BY count DESC
    `);

    const popularMoods = await db.all(`
      SELECT 
        json_extract(event_data, '$.mood') as mood,
        COUNT(*) as count
      FROM analytics_events 
      WHERE event_type = 'song_play'
        AND json_extract(event_data, '$.mood') IS NOT NULL
        ${timeCondition}
      GROUP BY mood
      ORDER BY count DESC
      LIMIT 10
    `);

    const popularLanguages = await db.all(`
      SELECT 
        json_extract(event_data, '$.language') as language,
        COUNT(*) as count
      FROM analytics_events 
      WHERE event_type = 'song_play'
        AND json_extract(event_data, '$.language') IS NOT NULL
        ${timeCondition}
      GROUP BY language
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      globalStats,
      popularMoods,
      popularLanguages,
      timeframe,
    });
  } catch (error) {
    console.error("❌ Error fetching global stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch global statistics",
    });
  }
});

// Helper functions
async function handleSongPlayEvent(data, userId) {
  // Update user's music preferences based on song play
  try {
    await db.run(
      `
      INSERT INTO user_preferences (user_id, mood, language, goal, play_count, last_played)
      VALUES (?, ?, ?, ?, 1, datetime('now'))
      ON CONFLICT(user_id, mood, language, goal) 
      DO UPDATE SET 
        play_count = play_count + 1,
        last_played = datetime('now')
    `,
      [userId, data.mood, data.language, data.goal]
    );
  } catch (error) {
    console.warn("Failed to update user preferences:", error);
  }
}

async function handlePlaylistOpenEvent(data, userId) {
  // Track playlist engagement
  try {
    await db.run(
      `
      INSERT INTO playlist_engagement (user_id, playlist_id, playlist_name, mood, goal, language, opened_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      [
        userId,
        data.playlistId,
        data.playlistName,
        data.mood,
        data.goal,
        data.language,
      ]
    );
  } catch (error) {
    console.warn("Failed to track playlist engagement:", error);
  }
}

function getTimeCondition(timeframe) {
  switch (timeframe) {
    case "1d":
      return "AND timestamp >= datetime('now', '-1 day')";
    case "7d":
      return "AND timestamp >= datetime('now', '-7 days')";
    case "30d":
      return "AND timestamp >= datetime('now', '-30 days')";
    case "90d":
      return "AND timestamp >= datetime('now', '-90 days')";
    default:
      return "";
  }
}

module.exports = router;
