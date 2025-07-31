import React, { useState } from "react";
import { FaMusic, FaSpotify, FaGlobeAmericas } from "react-icons/fa";
import { MdOutlineMood, MdMoodBad } from "react-icons/md";
import { BiSolidPlaylist } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import useAnalytics from "./hooks/useAnalytics"; // Import the analytics hook

export default function PlaylistFetcher() {
  const [mood, setMood] = useState("");
  const [goal, setGoal] = useState("match");
  const [language, setLanguage] = useState("english");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [playlist, setPlaylist] = useState(null);
  const [userId] = useState(
    () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const { logInteraction } = useAnalytics(); // Use only logInteraction

  // Mood emojis for visual feedback
  const moodEmojis = {
    happy: { emoji: "😊", description: "Feeling joyful and upbeat" },
    sad: { emoji: "😢", description: "Feeling down or melancholic" },
    calm: { emoji: "😌", description: "Feeling peaceful and relaxed" },
    excited: { emoji: "🤩", description: "Feeling energetic and thrilled" },
    angry: { emoji: "😠", description: "Feeling frustrated or upset" },
    anxious: { emoji: "😰", description: "Feeling worried or nervous" },
    tired: { emoji: "😴", description: "Feeling exhausted or sleepy" },
    bored: { emoji: "😑", description: "Feeling uninterested or restless" },
  };

  const currentMoodEmoji = moodEmojis[mood.toLowerCase()];

  const handleFetch = async () => {
    if (!mood.trim()) return;

    setIsLoading(true);
    setError("");
    setPlaylist(null);

    try {
      const startTime = Date.now();

      const response = await fetch(
        `http://localhost:3001/api/playlist/${encodeURIComponent(
          mood
        )}?goal=${goal}&language=${language}&userId=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch playlist");
      }

      const data = await response.json();
      setPlaylist(data);

      // 🎯 Track playlist generation analytics using logInteraction
      await logInteraction("playlist_generated", {
        mood: mood.toLowerCase(),
        goal: goal,
        language: language,
        playlistId: data.id,
        playlistName: data.name,
        userId: userId,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      });
    } catch (err) {
      setError(err.message);

      // Track failed playlist fetch using logInteraction
      logInteraction("playlist_fetch_failed", {
        mood,
        goal,
        language,
        error: err.message,
        severity: "high",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Card */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
              <FaMusic className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Mood Music Finder</h2>
          </div>
          <p className="text-gray-400">
            Tell us how you're feeling, and we'll find the perfect playlist for
            you
          </p>
        </div>

        {/* Mood Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            How are you feeling?
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., happy, sad, energetic, calm..."
              className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-6 pr-16 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 text-lg"
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                // Track mood input using logInteraction
                if (e.target.value.length > 2) {
                  logInteraction("mood_input", {
                    mood: e.target.value,
                    length: e.target.value.length,
                  });
                }
              }}
            />
            {currentMoodEmoji && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 group">
                <span className="text-3xl transform hover:scale-110 transition-transform cursor-help">
                  {currentMoodEmoji.emoji}
                </span>
                <div className="invisible group-hover:visible absolute right-0 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg z-10 border border-white/10">
                  {currentMoodEmoji.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What's your goal?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                {goal === "match" ? (
                  <MdOutlineMood className="text-purple-400 text-xl" />
                ) : (
                  <MdMoodBad className="text-purple-400 text-xl" />
                )}
              </div>
              <select
                className="w-full appearance-none bg-white/5 border border-white/20 rounded-xl py-4 px-12 pr-12 text-white cursor-pointer focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  // Track goal selection using logInteraction
                  logInteraction("goal_selection", {
                    previousGoal: goal,
                    newGoal: e.target.value,
                  });
                }}
              >
                <option value="match" className="bg-gray-800 text-white">
                  🎯 Match This Mood
                </option>
                <option value="recover" className="bg-gray-800 text-white">
                  🔄 Recover From Mood
                </option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <IoIosArrowDown className="text-purple-400 w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred language
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FaGlobeAmericas className="text-purple-400 text-xl" />
              </div>
              <select
                className="w-full appearance-none bg-white/5 border border-white/20 rounded-xl py-4 px-12 pr-12 text-white cursor-pointer focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  // Track language selection using logInteraction
                  logInteraction("language_selection", {
                    previousLanguage: language,
                    newLanguage: e.target.value,
                  });
                }}
              >
                <option value="english" className="bg-gray-800 text-white">
                  🇬🇧 English Songs
                </option>
                <option value="hindi" className="bg-gray-800 text-white">
                  🇮🇳 Hindi Songs
                </option>
                <option value="telugu" className="bg-gray-800 text-white">
                  🪔 Telugu Songs
                </option>
                <option value="tamil" className="bg-gray-800 text-white">
                  🎭 Tamil Songs
                </option>
                <option value="malayalam" className="bg-gray-800 text-white">
                  🌿 Malayalam Songs
                </option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <IoIosArrowDown className="text-purple-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleFetch}
          disabled={isLoading || !mood.trim()}
          className={`w-full ${
            isLoading || !mood.trim()
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105"
          } text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg text-lg`}
        >
          <FaSpotify className="text-2xl" />
          {isLoading ? "Finding Your Perfect Playlist..." : "Find My Playlist"}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Playlist Result */}
        {playlist && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <FaMusic className="text-purple-400 text-xl" />
              <h3 className="text-xl font-semibold text-white">
                {playlist.name}
              </h3>
            </div>

            <img
              src={playlist.image}
              alt="Playlist cover"
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <FaGlobeAmericas className="text-purple-400" />
                <span className="capitalize font-medium">
                  {playlist.language}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <BiSolidPlaylist className="text-purple-400" />
                <span className="capitalize font-medium">
                  {playlist.goal} mood
                </span>
              </div>
            </div>

            <a
              href={playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Track when user opens playlist in Spotify using logInteraction
                logInteraction("playlist_external_open", {
                  playlistId: playlist.id,
                  playlistName: playlist.name,
                  mood: playlist.mood,
                  goal: playlist.goal,
                  language: playlist.language,
                  platform: "spotify",
                });
              }}
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 transform hover:scale-105"
            >
              <FaSpotify className="text-2xl" />
              Open in Spotify
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
