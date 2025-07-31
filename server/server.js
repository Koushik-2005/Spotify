require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// --------------------- Middleware ---------------------
app.use(cors());
app.use(express.json());

// View engine (for server-rendered analytics page)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------------------- Routes ---------------------
const journalRoutes = require("./routes/journalRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api", journalRoutes);
app.use("/api", playlistRoutes);
app.use("/api", authRoutes);
app.use("/api/analytics", analyticsRoutes);

// Analytics dashboard route
app.get("/analytics/:userId", (req, res) => {
  const { userId } = req.params;
  const timeframe = req.query.timeframe || "7";

  res.render("analytics", {
    userId,
    timeframe,
    title: "Music Analytics Dashboard",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// --------------------- Error Handling ---------------------
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------------- Server Start ---------------------
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎵 Moodify server running on port ${PORT}`);
  console.log(
    `📊 Analytics dashboard: http://localhost:${PORT}/analytics/user123`
  );
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
