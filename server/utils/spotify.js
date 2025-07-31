const axios = require("axios");
require("dotenv").config();
const db = require("../db/database"); // Make sure this path is correct

let accessToken = null;

async function getAccessToken() {
  if (accessToken) return accessToken;

  try {
    const result = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
        },
      }
    );

    accessToken = result.data.access_token;
    return accessToken;
  } catch (err) {
    console.error(
      "❌ Spotify Access Token Error:",
      err.response?.data || err.message
    );
    throw new Error("Failed to get access token");
  }
}

// Mood and goal mapping
const moodSearchMap = {
  happy: {
    match: "happy upbeat playlist",
    recover: "calming relaxing playlist",
  },
  sad: {
    match: "sad emotional songs",
    recover: "uplifting motivational music",
  },
  anxious: {
    match: "calming ambient music",
    recover: "happy energetic playlist",
  },
  angry: {
    match: "aggressive intense music",
    recover: "peaceful meditation music",
  },
  calm: {
    match: "peaceful ambient music",
    recover: "upbeat energetic playlist",
  },
  tired: {
    match: "soft gentle music",
    recover: "workout energetic music",
  },
  bored: {
    match: "chill lofi music",
    recover: "party dance music",
  },
};

// Supported languages
const supportedLanguages = ["hindi", "telugu", "tamil", "english", "malayalam"];

// Normalize unknown moods to known ones
const normalizeMood = (mood) => {
  const map = {
    depressed: "sad",
    stressed: "anxious",
    lonely: "sad",
    frustrated: "angry",
    overwhelmed: "anxious",
    burntout: "tired",
    sleepy: "tired",
    excited: "happy",
  };

  return map[mood.toLowerCase()] || mood.toLowerCase();
};

// 📌 Log each request to database
// Enhanced logging function
async function logMoodRequest(mood, goal, language, userId) {
  try {
    // Log to mood_history table (existing)
    await db.run(
      "INSERT INTO mood_history (user_id, mood, goal, language) VALUES (?, ?, ?, ?)",
      [userId, mood.toLowerCase(), goal, language]
    );

    // Also log to analytics_events table for detailed tracking
    await db.run(
      `INSERT INTO analytics_events 
       (user_id, session_id, event_type, event_data, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        `session_${Date.now()}`, // Simple session ID
        "playlist_request",
        JSON.stringify({
          mood: mood.toLowerCase(),
          goal,
          language,
          timestamp: new Date().toISOString(),
        }),
        new Date().toISOString(),
      ]
    );

    console.log(`📊 Analytics logged: ${mood} playlist request for ${userId}`);
  } catch (err) {
    console.error("🛑 Error logging analytics:", err.message);
  }
}

async function getPlaylistForMood(
  mood,
  goal = "match",
  language = "english",
  userId
) {
  console.log("🎯 Fetching playlist for:", { mood, goal, language, userId });

  // Log the mood request
  if (userId) {
    await logMoodRequest(mood, goal, language, userId);
  }

  const normalizedMood = mood.toLowerCase().trim();
  const moodMap = moodSearchMap[normalizedMood] || {
    match: `${normalizedMood} music`,
    recover: `opposite of ${normalizedMood} music`,
  };

  const searchQuery = `${moodMap[goal]} ${language}`;
  console.log("🔍 Searching Spotify with:", searchQuery);

  try {
    const token = await getAccessToken(); // Use dynamic token instead of env variable
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchQuery,
        type: "playlist",
        limit: 1,
      },
    });

    const playlist = response.data.playlists?.items?.[0];
    if (!playlist) {
      console.warn("⚠️ No playlist found for keyword:", searchQuery);
      return null;
    }

    return {
      name: playlist.name,
      url: playlist.external_urls.spotify,
      image: playlist.images?.[0]?.url || null,
      goal,
      language,
    };
  } catch (error) {
    console.error(
      "❌ Spotify API Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch playlist");
  }
}

module.exports = getPlaylistForMood;
