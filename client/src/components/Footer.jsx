import React from "react";
import { FaMusic, FaHeart } from "react-icons/fa";
import useAnalytics from "../hooks/useAnalytics";

export default function Footer() {
  const { logInteraction } = useAnalytics();

  const handleLinkClick = (linkName) => {
    logInteraction("footer_link_click", linkName);
  };

  return (
    <footer className="relative mt-24 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-lg border-t border-white/10">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md">
                <FaMusic className="text-xl text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Mind Beats
              </h3>
            </div>
            <p className="text-gray-400 text-base leading-relaxed max-w-md mb-8">
              Discover the perfect playlist for your mood. Let AI curate music
              that matches your emotions and helps you feel better.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "Analytics", href: "/analytics" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => handleLinkClick(link.name)}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Placeholder for future content */}
          <div></div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 flex items-center gap-2">
            Made with <FaHeart className="text-red-400 animate-pulse" /> Sri Koushik
          </p>
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <a
              href="#"
              onClick={() => handleLinkClick("terms")}
              className="hover:text-purple-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              onClick={() => handleLinkClick("privacy")}
              className="hover:text-purple-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-xs md:text-sm">© 2025 Mind Beats. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
