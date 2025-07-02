// routes/authRoutes.js
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router();
require('dotenv').config();

// Redirect user to Spotify login
router.get('/login', (req, res) => {
  const scopes = [
    'user-read-email',
    'user-read-private',
    'user-top-read',
    'user-library-read',
    'playlist-read-private'
  ];

  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(' '),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// Callback route after Spotify login
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // In real app, save refresh_token securely in DB with user ID
    // For now: send back to frontend
    res.redirect(
      `http://localhost:3000/dashboard?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
    );
  } catch (err) {
    console.error('Error exchanging token:', err.response?.data || err.message);
    res.status(400).json({ error: 'Token exchange failed' });
  }
});

// Refresh access token using saved refresh token
router.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const result = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in } = result.data;

    res.json({ access_token, expires_in });
  } catch (err) {
    console.error('Refresh failed:', err.response?.data || err.message);
    res.status(400).json({ error: 'Refresh failed' });
  }
});

module.exports = router;
