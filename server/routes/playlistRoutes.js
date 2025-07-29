const express = require("express");
const router = express.Router();
const getPlaylistForMood = require("../utils/spotify");
const db = require("../db/database"); // ✅ Add this line

// Route to fetch playlist and log user action
router.get("/playlist/:mood", async (req, res) => {
  const { mood } = req.params;
  const { goal = "match", language = "english", userId } = req.query;

  console.log(
    `📥 API Request: mood=${mood}, goal=${goal}, language=${language}`
  );

  try {
    const playlist = await getPlaylistForMood(mood, goal, language, userId);

    if (!playlist) {
      console.log("⚠️ No playlist found");
      return res.status(404).json({ error: "No playlist found" });
    }

    console.log("✅ Playlist found:", playlist.name);
    res.json(playlist);
  } catch (err) {
    console.error("🔥 Route Error:", err.message || err);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

module.exports = router;
