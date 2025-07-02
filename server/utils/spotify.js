// utils/spotify.js
const axios = require('axios');
require('dotenv').config();

let accessToken = null;

async function getAccessToken() {
  if (accessToken) return accessToken;

  const result = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization':
          'Basic ' +
          Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      },
    }
  );

  accessToken = result.data.access_token;
  return accessToken;
}

const moodSearchMap = {
  happy: { match: 'happy hits', recover: 'relaxing music' },
  sad: { match: 'sad songs', recover: 'cheer up music' },
  anxious: { match: 'lofi chill', recover: 'calming focus' },
  calm: { match: 'peaceful piano', recover: 'uplift mood' },
};

async function getPlaylistForMood(mood, goal = 'match') {
  const token = await getAccessToken();
  const searchQuery = moodSearchMap[mood]?.[goal] || mood;

  const result = await axios.get('https://api.spotify.com/v1/search', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: searchQuery,
      type: 'playlist',
      limit: 1,
    },
  });

  const playlist = result.data.playlists.items[0];
  if (!playlist) return null;

  return {
    id: playlist.id,
    name: playlist.name,
    url: playlist.external_urls.spotify,
    image: playlist.images[0]?.url,
  };
}

module.exports = getPlaylistForMood;
