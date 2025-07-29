import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMusic, FaChartLine } from "react-icons/fa";

export default function Header() {
  const location = useLocation();

  return (
    <header className="backdrop-blur-xl bg-black/20 border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-105">
              <FaMusic className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Mind Beats
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className={`${
                location.pathname === '/' 
                  ? 'text-purple-400 bg-purple-500/10' 
                  : 'text-gray-300 hover:text-white'
              } font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/5`}
            >
              Home
            </Link>
            <Link
              to="/analytics"
              className={`${
                location.pathname === '/analytics' 
                  ? 'text-purple-400 bg-purple-500/10' 
                  : 'text-gray-300 hover:text-white'
              } flex items-center gap-2 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/5`}
            >
              <FaChartLine />
              Analytics
            </Link>
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 transform hover:scale-105">
              Sign in
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}