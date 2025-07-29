const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db/database");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "moodify_secret";

// Spotify scopes
const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-library-read",
  "playlist-read-private",
];

// Step 1: Redirect to Spotify login
router.get("/login", (req, res) => {
  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// Step 2: Spotify callback
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for access token
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    // Step 3: Get user profile from Spotify
    const userProfile = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: spotify_id, display_name, email } = userProfile.data;

    // Step 4: Insert or fetch user from spotify_users table
    let user = await db.get(
      `SELECT * FROM spotify_users WHERE spotify_id = ?`,
      [spotify_id]
    );

    if (!user) {
      const insert = await db.run(
        `INSERT INTO spotify_users (spotify_id, username, email) VALUES (?, ?, ?)`,
        [spotify_id, display_name, email]
      );

      user = {
        id: insert.lastID,
        spotify_id,
        username: display_name,
        email,
      };
    }

    // Step 5: Generate app JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  } catch (err) {
    console.error("❌ Spotify Auth Error:", err.response?.data || err.message);
    res.status(400).json({ error: "Spotify auth failed" });
  }
});

// Step 6: Refresh Spotify access token (optional)
router.post("/refresh_token", async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const result = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in } = result.data;
    res.json({ access_token, expires_in });
  } catch (err) {
    console.error("Refresh failed:", err.response?.data || err.message);
    res.status(400).json({ error: "Refresh failed" });
  }
});

module.exports = router;
