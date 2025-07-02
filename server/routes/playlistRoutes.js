// routes/playlistRoutes.js
const express = require('express');
const router = express.Router();
const getPlaylistForMood = require('../utils/spotify');

// GET /api/playlist/:mood?goal=match|recover
router.get('/playlist/:mood', async (req, res) => {
  const { mood } = req.params;
  const { goal = 'match' } = req.query; // default = match

  try {
    const playlist = await getPlaylistForMood(mood, goal);
    if (!playlist) {
      return res.status(404).json({ error: 'No playlist found' });
    }
    res.json(playlist);
  } catch (err) {
    console.error('Spotify fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

module.exports = router;
