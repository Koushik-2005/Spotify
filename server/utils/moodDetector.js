// utils/moodDetector.js
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function detectMood(note = '') {
  const result = sentiment.analyze(note);
  const score = result.score;

  if (score > 2) return 'happy';
  if (score < -2) return 'sad';
  if (score < 0) return 'anxious';
  return 'calm';
}

module.exports = detectMood;
