import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaMusic,
  FaHeart,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import axios from "axios";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    moods: [],
    goals: [],
    languages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // For now, using mock data since authentication isn't fully implemented
      // In production, you'd use: const response = await axios.get(`http://localhost:3001/api/analytics-json?range=${filter}`);

      const mockData = {
        moods: [
          { mood: "happy", count: 15 },
          { mood: "sad", count: 8 },
          { mood: "calm", count: 12 },
          { mood: "anxious", count: 6 },
          { mood: "excited", count: 10 },
        ],
        goals: [
          { goal: "match", count: 32 },
          { goal: "recover", count: 19 },
        ],
        languages: [
          { language: "english", count: 25 },
          { language: "hindi", count: 15 },
          { language: "tamil", count: 8 },
          { language: "telugu", count: 3 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: "from-yellow-400 to-orange-500",
      sad: "from-blue-400 to-blue-600",
      calm: "from-green-400 to-green-600",
      anxious: "from-red-400 to-red-600",
      excited: "from-purple-400 to-purple-600",
      angry: "from-red-500 to-red-700",
      tired: "from-gray-400 to-gray-600",
      bored: "from-indigo-400 to-indigo-600",
    };
    return colors[mood] || "from-gray-400 to-gray-600";
  };

  const totalMoodEntries = analyticsData.moods.reduce(
    (sum, mood) => sum + mood.count,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          Your Music Analytics
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Discover your listening patterns and mood trends over time
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-1">
          <FaFilter className="text-purple-400 ml-3" />
          {["all", "today", "week", "month"].map((timeFilter) => (
            <button
              key={timeFilter}
              onClick={() => setFilter(timeFilter)}
              className={`px-4 py-2 rounded-md capitalize transition-all duration-200 ${
                filter === timeFilter
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {timeFilter}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
          <FaMusic className="text-4xl text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {totalMoodEntries}
          </h3>
          <p className="text-gray-300">Total Playlists Generated</p>
        </div>

        <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
          <FaHeart className="text-4xl text-pink-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {analyticsData.moods.length}
          </h3>
          <p className="text-gray-300">Different Moods Explored</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
          <FaCalendarAlt className="text-4xl text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {analyticsData.languages.length}
          </h3>
          <p className="text-gray-300">Languages Used</p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaChartBar className="text-purple-400" />
          Mood Distribution
        </h2>
        <div className="space-y-4">
          {analyticsData.moods.map((mood) => {
            const percentage = ((mood.count / totalMoodEntries) * 100).toFixed(
              1
            );
            return (
              <div key={mood.mood} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white capitalize font-medium">
                    {mood.mood}
                  </span>
                  <span className="text-gray-300">
                    {mood.count} times ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getMoodColor(
                      mood.mood
                    )} transition-all duration-1000 ease-out group-hover:brightness-110`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals and Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Listening Goals</h3>
          <div className="space-y-4">
            {analyticsData.goals.map((goal) => (
              <div
                key={goal.goal}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <span className="text-white capitalize font-medium">
                  {goal.goal === "match" ? "🎯 Match Mood" : "🔄 Recover Mood"}
                </span>
                <span className="text-purple-400 font-bold">{goal.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Languages Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Language Preferences
          </h3>
          <div className="space-y-4">
            {analyticsData.languages.map((lang) => (
              <div
                key={lang.language}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <span className="text-white capitalize font-medium">
                  🌐 {lang.language}
                </span>
                <span className="text-indigo-400 font-bold">{lang.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 flex items-center gap-3 mx-auto">
          <FaDownload />
          Export Analytics
        </button>
      </div>
    </div>
  );
}
