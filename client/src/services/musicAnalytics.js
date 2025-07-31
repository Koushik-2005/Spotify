import axios from "axios";

const API_BASE = "http://localhost:3001/api";

class MusicAnalytics {
  constructor() {
    this.userId = this.getUserId();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.currentSong = null;
    this.songStartTime = null;
    this.totalListeningTime = 0;
    this.eventQueue = [];
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.flushEventQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    // Flush events before page unload
    window.addEventListener("beforeunload", () => {
      this.flushEventQueue();
      this.trackEvent("session_end", {
        sessionDuration: Date.now() - this.sessionStartTime,
        totalListeningTime: this.totalListeningTime,
      });
    });
  }

  getUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 12);
      localStorage.setItem("userId", userId);
    }
    return userId;
  }

  generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // Main tracking function
  async trackEvent(eventType, data = {}) {
    const event = {
      eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        platform: this.getPlatform(),
        sessionDuration: Date.now() - this.sessionStartTime,
      },
    };

    console.log(`🎵 Analytics Event: ${eventType}`, event);

    if (this.isOnline) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        console.warn(
          "Failed to send analytics event, queuing for later:",
          error
        );
        this.eventQueue.push(event);
      }
    } else {
      this.eventQueue.push(event);
    }

    // Store critical events in localStorage as backup
    if (["song_play", "song_complete", "playlist_open"].includes(eventType)) {
      this.storeEventLocally(event);
    }
  }

  async sendEvent(event) {
    await axios.post(`${API_BASE}/analytics/track`, event);
  }

  storeEventLocally(event) {
    try {
      const localEvents = JSON.parse(
        localStorage.getItem("musicAnalytics") || "[]"
      );
      localEvents.push(event);

      // Keep only last 100 events to prevent storage bloat
      if (localEvents.length > 100) {
        localEvents.splice(0, localEvents.length - 100);
      }

      localStorage.setItem("musicAnalytics", JSON.stringify(localEvents));
    } catch (error) {
      console.warn("Failed to store event locally:", error);
    }
  }

  async flushEventQueue() {
    if (this.eventQueue.length === 0) return;

    try {
      await axios.post(`${API_BASE}/analytics/batch`, {
        events: this.eventQueue,
        userId: this.userId,
      });
      this.eventQueue = [];
    } catch (error) {
      console.warn("Failed to flush event queue:", error);
    }
  }

  getPlatform() {
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Unknown";
  }

  // Music-specific tracking methods
  trackSongPlay(songData) {
    this.currentSong = songData;
    this.songStartTime = Date.now();

    this.trackEvent("song_play", {
      songId: songData.id,
      title: songData.name,
      artist: songData.artist || "Unknown Artist",
      album: songData.album || "Unknown Album",
      duration: songData.duration_ms,
      popularity: songData.popularity,
      explicit: songData.explicit,
      playlistId: songData.playlistId,
      playlistName: songData.playlistName,
      mood: songData.mood,
      goal: songData.goal,
      language: songData.language,
      source: "playlist_recommendation",
    });
  }

  trackSongPause(currentTime = 0) {
    if (!this.currentSong || !this.songStartTime) return;

    const listenDuration = Date.now() - this.songStartTime;
    this.totalListeningTime += listenDuration;

    this.trackEvent("song_pause", {
      songId: this.currentSong.id,
      title: this.currentSong.name,
      listenDuration,
      currentTime,
      pauseReason: "user_action",
    });
  }

  trackSongResume(currentTime = 0) {
    if (!this.currentSong) return;

    this.songStartTime = Date.now();

    this.trackEvent("song_resume", {
      songId: this.currentSong.id,
      title: this.currentSong.name,
      currentTime,
      resumeFrom: currentTime,
    });
  }

  trackSongSkip(currentTime = 0, reason = "user_skip") {
    if (!this.currentSong || !this.songStartTime) return;

    const listenDuration = Date.now() - this.songStartTime;
    const completion = this.currentSong.duration_ms
      ? (currentTime / this.currentSong.duration_ms) * 100
      : 0;

    this.trackEvent("song_skip", {
      songId: this.currentSong.id,
      title: this.currentSong.name,
      listenDuration,
      currentTime,
      completion,
      skipReason: reason,
    });
  }

  trackSongComplete() {
    if (!this.currentSong || !this.songStartTime) return;

    const listenDuration = Date.now() - this.songStartTime;
    this.totalListeningTime += listenDuration;

    this.trackEvent("song_complete", {
      songId: this.currentSong.id,
      title: this.currentSong.name,
      listenDuration,
      completion: 100,
      fullListen: true,
    });

    this.currentSong = null;
    this.songStartTime = null;
  }

  trackPlaylistOpen(playlistData) {
    this.trackEvent("playlist_open", {
      playlistId: playlistData.id,
      playlistName: playlistData.name,
      playlistUrl: playlistData.url,
      mood: playlistData.mood,
      goal: playlistData.goal,
      language: playlistData.language,
      source: "mood_recommendation",
      trackCount: playlistData.trackCount || 0,
    });
  }

  trackSearchQuery(query, results = []) {
    this.trackEvent("search_query", {
      query,
      resultCount: results.length,
      hasResults: results.length > 0,
      searchType: "mood_based",
    });
  }

  trackUserInteraction(action, target, metadata = {}) {
    this.trackEvent("user_interaction", {
      action,
      target,
      ...metadata,
    });
  }

  trackError(errorType, errorMessage, context = {}) {
    this.trackEvent("error", {
      errorType,
      errorMessage,
      context,
      severity: context.severity || "medium",
    });
  }

  // Analytics insights methods
  async getListeningStats() {
    try {
      const response = await axios.get(
        `${API_BASE}/analytics/stats/${this.userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch listening stats:", error);
      return null;
    }
  }

  async getMoodTrends(timeframe = "7d") {
    try {
      const response = await axios.get(
        `${API_BASE}/analytics/mood-trends/${this.userId}?timeframe=${timeframe}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch mood trends:", error);
      return null;
    }
  }
}

// Create global instance
const musicAnalytics = new MusicAnalytics();

// Export both the class and instance
export { MusicAnalytics, musicAnalytics };
export default musicAnalytics;
