
// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const journalRoutes = require('./routes/journalRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api', journalRoutes);
app.use('/api', playlistRoutes);
app.use('/api',authRoutes)
app.get('/', (req, res) => {
  res.send('Moodify backend is running 🎧');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
