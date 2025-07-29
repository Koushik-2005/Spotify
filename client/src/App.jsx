import React from "react";
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

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
                      {/* Hero Section */}
                      <div className="text-center mb-16">
                        <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-6 leading-tight">
                          Find Your Perfect
                        </h1>
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
                          Mood Playlist
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                          Discover music that matches your emotions and helps you feel better. 
                          Our AI-powered system curates playlists based on your current mood.
                        </p>
                      </div>
                      <PlaylistFetcher />
                    </div>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <div className="max-w-6xl mx-auto">
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
  );
}