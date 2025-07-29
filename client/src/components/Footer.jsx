import React from "react";
import {
  FaMusic,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaHeart,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import useAnalytics from "../hooks/useAnalytics";

export default function Footer() {
  const { logInteraction } = useAnalytics();

  const handleSocialClick = (platform) => {
    logInteraction("social_click", platform);
  };

  const handleLinkClick = (linkName) => {
    logInteraction("footer_link_click", linkName);
  };

  return (
    <footer className="relative mt-20 backdrop-blur-xl bg-black/20 border-t border-white/10">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>

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
              Discover the perfect playlist for your mood. Let AI curate music
              that matches your emotions and helps you feel better.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                onClick={() => handleSocialClick("github")}
                className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-white/5"
              >
                <FaGithub className="text-2xl" />
              </a>
              <a
                href="#"
                onClick={() => handleSocialClick("twitter")}
                className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-white/5"
              >
                <FaTwitter className="text-2xl" />
              </a>
              <a
                href="#"
                onClick={() => handleSocialClick("linkedin")}
                className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 p-2 rounded-lg hover:bg-white/5"
              >
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Analytics", href: "/analytics" },
                { name: "About Us", href: "#" },
                { name: "How it Works", href: "#" },
                { name: "Privacy Policy", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => handleLinkClick(link.name)}
                    className="text-gray-400 hover:text-purple-400 transition-colors hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <FaEnvelope className="text-purple-400" />
                <span>hello@mindbeats.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FaPhone className="text-purple-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FaMapMarkerAlt className="text-purple-400" />
                <span>San Francisco, CA</span>
              </li>
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h5 className="text-white font-medium mb-3">Stay Updated</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
                <button
                  onClick={() => logInteraction("newsletter_signup", "footer")}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 flex items-center gap-2">
            Made with <FaHeart className="text-red-400 animate-pulse" /> by Mind
            Beats Team
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
            <span>© 2025 Mind Beats. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
