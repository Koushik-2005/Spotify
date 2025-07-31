import musicAnalytics from "./musicAnalytics";

/**
 * Global trackEvent function for music analytics
 * This is the main entry point for all analytics events
 * @param {string} eventType - Type of event (song_play, song_pause, etc.)
 * @param {object} data - Event data including songData, userId, etc.
 */
export const trackEvent = async (eventType, data = {}) => {
  try {
    // Ensure userId is available globally
    const globalUserId =
      data.userId ||
      localStorage.getItem("userId") ||
      musicAnalytics.getUserId();

    // Enhanced event data with global context
    const enhancedData = {
      ...data,
      userId: globalUserId,
      timestamp: new Date().toISOString(),
      sessionId: musicAnalytics.sessionId,
      platform: musicAnalytics.getPlatform(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      deviceType: getDeviceType(),
      networkType: getNetworkType(),
    };

    console.log(`🎵 Global Analytics Event: ${eventType}`, enhancedData);

    // Route to appropriate tracking method based on event type
    switch (eventType) {
      case "song_play":
        await musicAnalytics.trackSongPlay(
          enhancedData.songData || enhancedData
        );
        break;

      case "song_pause":
        await musicAnalytics.trackSongPause(enhancedData.currentTime || 0);
        break;

      case "song_resume":
        await musicAnalytics.trackSongResume(enhancedData.currentTime || 0);
        break;

      case "song_skip":
        await musicAnalytics.trackSongSkip(
          enhancedData.currentTime || 0,
          enhancedData.reason || "user_skip"
        );
        break;

      case "song_complete":
        await musicAnalytics.trackSongComplete();
        break;

      case "playlist_open":
        await musicAnalytics.trackPlaylistOpen(
          enhancedData.playlistData || enhancedData
        );
        break;

      case "search_query":
        await musicAnalytics.trackSearchQuery(
          enhancedData.query,
          enhancedData.results || []
        );
        break;

      case "user_interaction":
        await musicAnalytics.trackUserInteraction(
          enhancedData.action,
          enhancedData.target,
          enhancedData.metadata || {}
        );
        break;

      case "error":
        await musicAnalytics.trackError(
          enhancedData.errorType,
          enhancedData.errorMessage,
          enhancedData.context || {}
        );
        break;

      // New music-specific events
      case "song_like":
        await trackSongLike(enhancedData);
        break;

      case "song_share":
        await trackSongShare(enhancedData);
        break;

      case "volume_change":
        await trackVolumeChange(enhancedData);
        break;

      case "seek":
        await trackSeek(enhancedData);
        break;

      case "repeat_mode":
        await trackRepeatMode(enhancedData);
        break;

      case "shuffle_mode":
        await trackShuffleMode(enhancedData);
        break;

      default:
        // Generic event tracking
        await musicAnalytics.trackEvent(eventType, enhancedData);
        break;
    }

    // Store critical events locally as backup
    if (isCriticalEvent(eventType)) {
      storeCriticalEvent(eventType, enhancedData);
    }
  } catch (error) {
    console.error("❌ Global trackEvent failed:", error);
    // Store failed events for retry
    storeFailedEvent(eventType, data, error);
  }
};

// Helper function to get device type
function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return "tablet";
  } else if (
    /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(
      userAgent
    )
  ) {
    return "mobile";
  } else {
    return "desktop";
  }
}

// Helper function to get network type
function getNetworkType() {
  if ("connection" in navigator) {
    return navigator.connection.effectiveType || "unknown";
  }
  return "unknown";
}

// Additional music-specific tracking functions
async function trackSongLike(data) {
  await musicAnalytics.trackEvent("song_like", {
    songId: data.songId,
    songName: data.songName,
    artist: data.artist,
    liked: data.liked,
    playlistId: data.playlistId,
    mood: data.mood,
    likeSource: data.source || "player_controls",
  });
}

async function trackSongShare(data) {
  await musicAnalytics.trackEvent("song_share", {
    songId: data.songId,
    songName: data.songName,
    artist: data.artist,
    shareMethod: data.method, // 'copy_link', 'social_media', etc.
    shareDestination: data.destination,
  });
}

async function trackVolumeChange(data) {
  await musicAnalytics.trackEvent("volume_change", {
    previousVolume: data.previousVolume,
    newVolume: data.newVolume,
    changeType: data.changeType || "slider", // 'slider', 'mute', 'unmute'
    songId: data.songId,
  });
}

async function trackSeek(data) {
  await musicAnalytics.trackEvent("seek", {
    songId: data.songId,
    fromTime: data.fromTime,
    toTime: data.toTime,
    seekDistance: Math.abs(data.toTime - data.fromTime),
    seekDirection: data.toTime > data.fromTime ? "forward" : "backward",
    seekMethod: data.method || "progress_bar", // 'progress_bar', 'keyboard', etc.
  });
}

async function trackRepeatMode(data) {
  await musicAnalytics.trackEvent("repeat_mode", {
    previousMode: data.previousMode,
    newMode: data.newMode, // 'none', 'song', 'playlist'
    songId: data.songId,
    playlistId: data.playlistId,
  });
}

async function trackShuffleMode(data) {
  await musicAnalytics.trackEvent("shuffle_mode", {
    shuffleEnabled: data.shuffleEnabled,
    playlistId: data.playlistId,
    playlistSize: data.playlistSize,
  });
}

// Check if event is critical and should be stored locally
function isCriticalEvent(eventType) {
  const criticalEvents = [
    "song_play",
    "song_complete",
    "playlist_open",
    "song_like",
    "search_query",
  ];
  return criticalEvents.includes(eventType);
}

// Store critical events in localStorage
function storeCriticalEvent(eventType, data) {
  try {
    const criticalEvents = JSON.parse(
      localStorage.getItem("criticalAnalyticsEvents") || "[]"
    );
    criticalEvents.push({
      eventType,
      data,
      timestamp: new Date().toISOString(),
      stored: true,
    });

    // Keep only last 50 critical events
    if (criticalEvents.length > 50) {
      criticalEvents.splice(0, criticalEvents.length - 50);
    }

    localStorage.setItem(
      "criticalAnalyticsEvents",
      JSON.stringify(criticalEvents)
    );
  } catch (error) {
    console.warn("Failed to store critical event:", error);
  }
}

// Store failed events for retry
function storeFailedEvent(eventType, data, error) {
  try {
    const failedEvents = JSON.parse(
      localStorage.getItem("failedAnalyticsEvents") || "[]"
    );
    failedEvents.push({
      eventType,
      data,
      error: error.message,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });

    // Keep only last 20 failed events
    if (failedEvents.length > 20) {
      failedEvents.splice(0, failedEvents.length - 20);
    }

    localStorage.setItem("failedAnalyticsEvents", JSON.stringify(failedEvents));
  } catch (err) {
    console.warn("Failed to store failed event:", err);
  }
}

// Retry failed events
export const retryFailedEvents = async () => {
  try {
    const failedEvents = JSON.parse(
      localStorage.getItem("failedAnalyticsEvents") || "[]"
    );
    const retryableEvents = failedEvents.filter(
      (event) => event.retryCount < 3
    );

    for (const event of retryableEvents) {
      try {
        await trackEvent(event.eventType, event.data);
        // Remove from failed events if successful
        const index = failedEvents.indexOf(event);
        failedEvents.splice(index, 1);
      } catch (error) {
        // Increment retry count
        event.retryCount = (event.retryCount || 0) + 1;
        event.lastRetry = new Date().toISOString();
      }
    }

    localStorage.setItem("failedAnalyticsEvents", JSON.stringify(failedEvents));
  } catch (error) {
    console.warn("Failed to retry events:", error);
  }
};

// Analytics configuration
export const analyticsConfig = {
  enableConsoleLogging: true,
  enableLocalStorage: true,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  retryFailedEvents: true,
  criticalEventsOnly: false,
};

// Initialize analytics
export const initializeAnalytics = (config = {}) => {
  Object.assign(analyticsConfig, config);

  // Set up periodic retry of failed events
  if (analyticsConfig.retryFailedEvents) {
    setInterval(retryFailedEvents, 60000); // Retry every minute
  }

  console.log("🎵 Global Music Analytics initialized", analyticsConfig);
};

// Export default trackEvent function
export default trackEvent;
