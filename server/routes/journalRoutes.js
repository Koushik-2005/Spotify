// routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const detectMood = require('../utils/moodDetector');

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
router.get('/mood-stats', (req, res) => {
  db.all(
    `SELECT mood, COUNT(*) as count FROM journal_entries GROUP BY mood`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching stats:', err.message);
        return res.status(500).json({ error: 'Stats fetch failed' });
      }
      const stats = {};
      rows.forEach((row) => {
        stats[row.mood] = row.count;
      });
      res.json(stats);
    }
  );
});

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
