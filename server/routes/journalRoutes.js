// routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const detectMood = require('../utils/moodDetector');

// Inside routes/journalRoutes.js
router.get('/mood-stats', (req, res) => {
  db.all(
    `SELECT mood, COUNT(*) as count FROM journal_entries GROUP BY mood ORDER BY count DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching stats:', err.message);
        return res.status(500).json({ error: 'Stats fetch failed' });
      }
      res.json(rows);  // Return array like [{ mood: 'calm', count: 3 }, ...]
    }
  );
});



router.put('/journal/:id/playlist', async (req, res) => {
  const { id } = req.params;
  const { playlist } = req.body;

  if (!playlist || !playlist.id || !playlist.url || !playlist.name) {
    return res.status(400).json({ error: 'Invalid playlist data' });
  }

  try {
    await db.run(
      `UPDATE journal SET playlist_id = ?, playlist_url = ?, playlist_name = ?, playlist_image = ? WHERE id = ?`,
      [playlist.id, playlist.url, playlist.name, playlist.image, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating journal playlist:', err);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});
// POST /api/journal
router.post('/journal', (req, res) => {
  const { note, mood: moodInput } = req.body;

  const mood = moodInput || detectMood(note);
  const date = new Date().toISOString().split('T')[0];

  const insertQuery = `
    INSERT INTO journal_entries (date, mood, note)
    VALUES (?, ?, ?)
  `;

  db.run(insertQuery, [date, mood, note], function (err) {
    if (err) {
      console.error('Error saving journal:', err.message);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    res.status(201).json({
      message: 'Journal entry saved',
      id: this.lastID,
      date,
      mood,
      note,
    });
  });
});

// GET /api/journal - fetch all entries
router.get('/journal', (req, res) => {
  db.all(`SELECT * FROM journal_entries ORDER BY date DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching entries:', err.message);
      return res.status(500).json({ error: 'Database fetch failed' });
    }
    res.json(rows);
  });
});

// GET /api/mood-stats - get mood frequency


// PUT /api/journal/:id/playlist - save playlist info to journal
router.put('/journal/:id/playlist', (req, res) => {
  const { id } = req.params;
  const { playlist_id, playlist_url } = req.body;

  db.run(
    `UPDATE journal_entries SET playlist_id = ?, playlist_url = ? WHERE id = ?`,
    [playlist_id, playlist_url, id],
    function (err) {
      if (err) {
        console.error('Error updating playlist info:', err.message);
        return res.status(500).json({ error: 'Update failed' });
      }

      res.json({ message: 'Playlist info updated successfully' });
    }
  );
});

module.exports = router;
