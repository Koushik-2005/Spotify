import React, { useState, useEffect } from "react";
import {
  FaMusic,
  FaPlay,
  FaChartLine,
  FaClock,
  FaSkipForward,
  FaHeart,
  FaHeadphones,
} from "react-icons/fa";
import musicAnalytics from "../services/musicAnalytics";

const MusicAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [moodTrends, setMoodTrends] = useState(null);
  const [timeframe, setTimeframe] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsData, trendsData] = await Promise.all([
        musicAnalytics.getListeningStats(),
        musicAnalytics.getMoodTrends(timeframe),
      ]);

      setStats(statsData?.stats);
      setMoodTrends(trendsData?.trends);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return "0m";
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getMoodEmoji = (mood) => {
    const emojiMap = {
      happy: "😊",
      sad: "😢",
      calm: "😌",
      excited: "🤩",
      angry: "😡",
      anxious: "😰",
      tired: "😴",
      bored: "🥱",
    };
    return emojiMap[mood] || "🎵";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          Your Music Analytics
        </h2>
        <p className="text-gray-300">
          Discover your listening patterns and musical journey
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 flex gap-1">
          {[
            { value: "1d", label: "24h" },
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "3 months" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeframe === option.value
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <>
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <FaClock className="text-3xl text-purple-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                {formatDuration(stats.totalListeningTime)}
              </h3>
              <p className="text-gray-300 text-sm">Total Listening Time</p>
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <FaPlay className="text-3xl text-green-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                {stats.songPlays}
              </h3>
              <p className="text-gray-300 text-sm">Songs Played</p>
            </div>

            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <FaHeadphones className="text-3xl text-blue-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                {stats.completionRate}%
              </h3>
              <p className="text-gray-300 text-sm">Completion Rate</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <FaSkipForward className="text-3xl text-yellow-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                {stats.skipRate}%
              </h3>
              <p className="text-gray-300 text-sm">Skip Rate</p>
            </div>
          </div>

          {/* Top Moods */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FaChartLine className="text-purple-400" />
              Your Top Moods
            </h3>

            {stats.topMoods && stats.topMoods.length > 0 ? (
              <div className="space-y-4">
                {stats.topMoods.map((mood, index) => {
                  const percentage =
                    stats.songPlays > 0
                      ? ((mood.count / stats.songPlays) * 100).toFixed(1)
                      : 0;
                  return (
                    <div
                      key={mood.mood}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getMoodEmoji(mood.mood)}
                        </span>
                        <span className="text-white capitalize font-medium">
                          {mood.mood}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-sm w-12 text-right">
                          {mood.count} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No mood data available for this timeframe
              </p>
            )}
          </div>

          {/* Listening Pattern by Hour */}
          {stats.hourlyPattern && stats.hourlyPattern.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Listening Patterns (24h)
              </h3>
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 24 }, (_, hour) => {
                  const hourData = stats.hourlyPattern.find(
                    (h) => parseInt(h.hour) === hour
                  );
                  const count = hourData ? hourData.count : 0;
                  const maxCount = Math.max(
                    ...stats.hourlyPattern.map((h) => h.count),
                    1
                  );
                  const height = (count / maxCount) * 100;

                  return (
                    <div key={hour} className="text-center">
                      <div className="relative h-20 bg-gray-700 rounded-sm mb-2">
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-sm"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {hour.toString().padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activity Summary */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Session Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {stats.completedSongs}
                </div>
                <div className="text-sm text-gray-400">Songs Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">
                  {stats.skippedSongs}
                </div>
                <div className="text-sm text-gray-400">Songs Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">
                  {stats.songPlays > 0
                    ? Math.round(
                        stats.totalListeningTime / 60000 / stats.songPlays
                      )
                    : 0}
                  m
                </div>
                <div className="text-sm text-gray-400">Avg. Listen Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.topMoods?.[0]?.mood || "N/A"}
                </div>
                <div className="text-sm text-gray-400">Top Mood</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mood Trends */}
      {moodTrends && Object.keys(moodTrends).length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Mood Trends Over Time
          </h3>
          <div className="space-y-4">
            {Object.entries(moodTrends)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 7)
              .map(([date, moods]) => (
                <div
                  key={date}
                  className="flex items-center justify-between py-3 border-b border-white/10"
                >
                  <span className="text-gray-300 font-medium">
                    {new Date(date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {moods.slice(0, 3).map((mood, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1"
                      >
                        <span className="text-sm">
                          {getMoodEmoji(mood.mood)}
                        </span>
                        <span className="text-xs text-gray-300 capitalize">
                          {mood.mood} ({mood.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicAnalyticsDashboard;
