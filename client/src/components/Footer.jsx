import React from "react";
import { FaMusic, FaGithub, FaTwitter, FaLinkedin, FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative mt-20 backdrop-blur-xl bg-black/20 border-t border-white/10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                <FaMusic className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Mind Beats
              </h3>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-6">
              Discover the perfect playlist for your mood. Let AI curate music that matches your emotions and helps you feel better.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110">
                <FaGithub className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110">
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          

          {/* Support */}
          
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 flex items-center gap-2">
            Made with <FaHeart className="text-red-400" /> by Mind Beats Team
          </p>
          <p className="text-gray-400">
            © 2025 Mind Beats. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}