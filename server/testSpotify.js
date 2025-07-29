// testSpotify.js
const getPlaylistForMood = require('./utils/spotify');

(async () => {
  try {
    // Try to get a playlist for mood "happy" with default goal "match"
    const playlist = await getPlaylistForMood('sad');
    if (playlist) {
      console.log('Playlist found:');
      console.log('Name:', playlist.name);
      console.log('URL:', playlist.url);
      console.log('Image:', playlist.image);
    } else {
      console.log('No playlist found for that mood.');
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();
