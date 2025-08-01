import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMusic, FaChartLine, FaUser, FaBars, FaTimes } from "react-icons/fa";
import useAnalytics from "../hooks/useAnalytics";

export default function Header() {
  const location = useLocation();
  const { logInteraction } = useAnalytics();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    logInteraction("page_visit", location.pathname);
  }, [location.pathname, logInteraction]);

  const handleNavClick = (page) => {
    logInteraction("navigation_click", page);
    setMenuOpen(false); // Close menu on navigation
  };

  return (
    <header className="backdrop-blur-xl bg-black/20 border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => handleNavClick("home")}
          >
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3">
              <FaMusic className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Mind Beats
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              onClick={() => handleNavClick("home")}
              className={`${
                location.pathname === "/"
                  ? "text-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                  : "text-gray-300 hover:text-white"
              } font-medium transition-all duration-200 px-6 py-3 rounded-lg hover:bg-white/5 transform hover:scale-105 hover:shadow-lg`}
            >
              🏠 Home
            </Link>
            <Link
              to="/analytics"
              onClick={() => handleNavClick("analytics")}
              className={`${
                location.pathname === "/analytics"
                  ? "text-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                  : "text-gray-300 hover:text-white"
              } flex items-center gap-2 font-medium transition-all duration-200 px-6 py-3 rounded-lg hover:bg-white/5 transform hover:scale-105 hover:shadow-lg`}
            >
              <FaChartLine />
              Analytics
            </Link>
            <button
              className="text-gray-300 hover:text-white transition-all duration-200 p-3 rounded-lg hover:bg-white/5 transform hover:scale-105"
              onClick={() => logInteraction("profile_click", "header")}
            >
              <FaUser className="text-lg" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-3 rounded-lg hover:bg-white/10 transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2 animate-fade-in">
            <Link
              to="/"
              onClick={() => handleNavClick("home")}
              className="block text-white bg-white/10 px-4 py-2 rounded-lg"
            >
              🏠 Home
            </Link>
            <Link
              to="/analytics"
              onClick={() => handleNavClick("analytics")}
              className="block text-white bg-white/10 px-4 py-2 rounded-lg"
            >
              📊 Analytics
            </Link>
            {/* <button
              onClick={() => {
                logInteraction("profile_click", "header");
                setMenuOpen(false);
              }}
              className="block w-full text-left text-white bg-white/10 px-4 py-2 rounded-lg"
            >
              👤 Profile
            </button> */}
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-75"></div>
      </div>
    </header>
  );
}
