import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PlaylistFetcher from "./PlayListFetcher";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Analytics from "./components/Analytics";
import useAnalytics from "./hooks/useAnalytics";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold text-red-400 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 mb-6">
              We're sorry for the inconvenience. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-500 mb-4"></div>
      <p className="text-white text-lg">Loading Mind Beats...</p>
    </div>
  </div>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appStats, setAppStats] = useState(null);
  const { logInteraction, fetchAppStats } = useAnalytics();

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Generate or get user ID
        let userId = localStorage.getItem("userId");
        if (!userId) {
          userId = "user_" + Math.random().toString(36).substr(2, 9);
          localStorage.setItem("userId", userId);
        }

        // Log app start
        logInteraction("app_start", "main");

        // Fetch initial app stats
        const stats = await fetchAppStats();
        setAppStats(stats);

        // Simulate loading time for better UX
        setTimeout(() => setIsLoading(false), 100);
      } catch (error) {
        console.error("App initialization error:", error);
        setIsLoading(false);
      }
    };

    initApp();
  }, [logInteraction, fetchAppStats]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-x-hidden">
          {/* Enhanced Animated Background Orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute top-20 left-20 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl animate-bounce"
              style={{ animationDelay: "3s" }}
            />
            <div
              className="absolute bottom-20 right-20 w-48 h-48 bg-green-600/20 rounded-full blur-2xl animate-bounce"
              style={{ animationDelay: "4s" }}
            />
          </div>

          {/* Floating particles effect */}
          <div className="fixed inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
              <div className="container mx-auto px-6 py-12">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div className="max-w-4xl mx-auto">
                        {/* Enhanced Hero Section */}
                        <div className="text-center mb-16">
                          <div className="mb-8">
                            <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-6 leading-tight animate-fade-in">
                              Find Your Perfect
                            </h1>
                            <h2
                              className="text-5xl md:text-6xl font-bold text-white mb-8 animate-fade-in"
                              style={{ animationDelay: "0.2s" }}
                            >
                              Mood Playlist
                            </h2>
                          </div>
                         

                          {/* App Stats Display */}
                          {appStats && (
                            <div
                              className="flex justify-center gap-8 mb-8 animate-fade-in"
                              style={{ animationDelay: "0.6s" }}
                            >
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                  {appStats.stats?.totalRequests || 0}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Playlists Generated
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-400">
                                  {appStats.stats?.uniqueUsers || 0}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Happy Users
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-pink-400">
                                  {appStats.stats?.popularMood?.mood || "Happy"}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Popular Mood
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          className="animate-fade-in"
                          style={{ animationDelay: "0.8s" }}
                        >
                          <PlaylistFetcher />
                        </div>
                      </div>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <div className="max-w-6xl mx-auto animate-fade-in">
                        <Analytics />
                      </div>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
