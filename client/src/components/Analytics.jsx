import React, { useState, useEffect } from "react";
import {
  FaMusic,
  FaHeart,
  FaCalendarAlt,
  FaChartBar,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import useAnalytics from "../hooks/useAnalytics";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    moods: [],
    goals: [],
    languages: [],
    stats: {
      totalPlaylists: 0,
      uniqueMoods: 0,
      languagesUsed: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const { getAnalyticsData } = useAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/analytics-json?range=${filter}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setAnalyticsData({
        moods: data.moods || [],
        goals: data.goals || [],
        languages: data.languages || [],
        stats: {
          totalPlaylists: data.moods?.reduce((sum, m) => sum + m.count, 0) || 0,
          uniqueMoods: data.moods?.length || 0,
          languagesUsed: data.languages?.length || 0,
        },
      });
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error("Analytics fetch error:", err);
      setAnalyticsData({
        moods: [],
        goals: [],
        languages: [],
        stats: {
          totalPlaylists: 0,
          uniqueMoods: 0,
          languagesUsed: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: "bg-gradient-to-r from-yellow-400 to-orange-500",
      sad: "bg-gradient-to-r from-blue-400 to-blue-600",
      calm: "bg-gradient-to-r from-green-400 to-green-600",
      anxious: "bg-gradient-to-r from-red-400 to-red-600",
      excited: "bg-gradient-to-r from-purple-400 to-purple-600",
      angry: "bg-gradient-to-r from-red-500 to-red-700",
      tired: "bg-gradient-to-r from-gray-400 to-gray-600",
      bored: "bg-gradient-to-r from-indigo-400 to-indigo-600",
    };
    return colors[mood] || "bg-gradient-to-r from-gray-400 to-gray-600";
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: "😊",
      sad: "😢",
      calm: "😌",
      anxious: "😰",
      excited: "🤩",
      angry: "😠",
      tired: "😴",
      bored: "😑",
    };
    return emojis[mood] || "🎵";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          Your Music Analytics
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Discover your listening patterns and mood trends over time
        </p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
          <FaMusic className="text-4xl text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {analyticsData.stats.totalPlaylists}
          </h3>
          <p className="text-gray-300">Total Playlists Generated</p>
        </div>

        <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
          <FaHeart className="text-4xl text-pink-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {analyticsData.stats.uniqueMoods}
          </h3>
          <p className="text-gray-300">Different Moods Explored</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
          <FaCalendarAlt className="text-4xl text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {analyticsData.stats.languagesUsed}
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
        {analyticsData.moods.length > 0 ? (
          <div className="space-y-4">
            {analyticsData.moods.map((mood) => {
              const percentage =
                analyticsData.stats.totalPlaylists > 0
                  ? (
                      (mood.count / analyticsData.stats.totalPlaylists) *
                      100
                    ).toFixed(1)
                  : 0;
              return (
                <div
                  key={mood.mood}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                    <span className="text-white capitalize font-medium">
                      {mood.mood}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full ${getMoodColor(
                          mood.mood
                        )} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-300 min-w-[3rem]">
                      {mood.count}
                    </span>
                    <span className="text-gray-400 text-sm min-w-[3rem]">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No mood data available yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Start generating playlists to see your mood analytics
            </p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Bar Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Mood Chart</h3>
          {analyticsData.moods.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={analyticsData.moods}
    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
  >
   <XAxis
  dataKey="mood"
  stroke="#ccc"
  interval={0}
  angle={-35}
  textAnchor="end"
  height={60}
/>


    <YAxis stroke="#ccc" />
    <Tooltip
      contentStyle={{
        backgroundColor: "#1f1f1f",
        border: "none",
        borderRadius: 8,
        color: "#fff"
      }}
      cursor={{ fill: "rgba(168, 85, 247, 0.2)" }}
    />
    <Bar
      dataKey="count"
      fill="#a855f7"
      radius={[8, 8, 0, 0]}
      isAnimationActive={true}
    >
      {analyticsData.moods.map((entry, index) => (
        <Cell
          key={`bar-${index}`}
          cursor="pointer"
          fill="#a855f7"
          onMouseOver={(e) => (e.target.style.fill = "#c084fc")}
          onMouseOut={(e) => (e.target.style.fill = "#a855f7")}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>

          ) : (
            <p className="text-gray-400">No mood data for chart</p>
          )}
        </div>

        {/* Language Pie Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Language Pie Chart
          </h3>
          {analyticsData.languages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.languages}
                  dataKey="count"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  isAnimationActive={true}
                >
                  {analyticsData.languages.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      cursor="pointer"
                      fill={
                        [
                          "#8b5cf6",
                          "#6366f1",
                          "#3b82f6",
                          "#06b6d4",
                          "#10b981",
                          "#84cc16",
                        ][index % 6]
                      }
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f1f1f",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No language data for chart</p>
          )}
        </div>
      </div>

      {/* Goals and Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Listening Goals</h3>
          {analyticsData.goals.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.goals.map((goal) => (
                <div
                  key={goal.goal}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300 capitalize">
                    {goal.goal} mood
                  </span>
                  <span className="text-purple-400 font-semibold">
                    {goal.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No goal data available yet</p>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Language Preferences
          </h3>
          {analyticsData.languages.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.languages.map((lang) => (
                <div
                  key={lang.language}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300 capitalize">
                    {lang.language}
                  </span>
                  <span className="text-indigo-400 font-semibold">
                    {lang.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No language data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="text-center">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(analyticsData, null, 2);
            const dataUri =
              "data:application/json;charset=utf-8," +
              encodeURIComponent(dataStr);
            const exportFileDefaultName = `music-analytics-${
              new Date().toISOString().split("T")[0]
            }.json`;
            const linkElement = document.createElement("a");
            linkElement.setAttribute("href", dataUri);
            linkElement.setAttribute("download", exportFileDefaultName);
            linkElement.click();
          }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 flex items-center gap-3 mx-auto"
        >
          <FaDownload />
          Export Analytics
        </button>
      </div>
    </div>
  );
}
