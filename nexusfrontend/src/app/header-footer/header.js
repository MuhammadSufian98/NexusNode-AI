"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassButton from "@/component/Button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle scroll to shrink header height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "How it works", link: "#how-it-works", type: "link" },
    { name: "Features", link: "#features", type: "link" },
    { name: "Pricing", link: "#pricing", type: "link" },
    { name: "Sign In", link: "/auth", type: "button" },
  ];

  return (
    <motion.header
      animate={{
        height: isScrolled ? "50px" : "70px",
        backgroundColor: isScrolled
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(255, 255, 255, 0.15)",
      }}
      className="fixed top-0 w-full z-50 flex items-center justify-between px-10 backdrop-blur-lg border-b border-white/20 transition-all duration-300 shadow-lg"
    >
      {/* Logo Section */}
      <div className="text-2xl font-bold tracking-tighter text-slate-900 italic">
        Nexus <span className="text-blue-600">Node</span>
      </div>

      {/* Navigation Array */}
      <nav className="flex items-center gap-8">
        {navItems.map((item, index) => {
          // Check if the item is the "Sign In" button and the user is logged in
          if (item.name === "Sign In") {
            return isLoggedIn ? (
              <div
                key="profile"
                className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-400 to-purple-500 border border-white/40 cursor-pointer hover:scale-110 transition-transform"
                title="Profile"
              />
            ) : (
              <motion.div
                key={index}
                className="relative group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <span className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />

                {/* Sign In Button */}
                <GlassButton
                  className="text-sm px-4 py-2"
                  onClick={() => setIsLoggedIn(true)}
                >
                  {item.name}
                </GlassButton>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={index}
              className="relative group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />

              {item.type === "button" ? (
                <GlassButton
                  className="text-sm px-4 py-2"
                  onClick={() => setIsLoggedIn(!isLoggedIn)}
                >
                  {item.name}
                </GlassButton>
              ) : (
                <a
                  href={item.link}
                  className="relative px-4 py-2 text-sm font-medium transition-all rounded-full text-slate-800 group"
                >
                  {/* Hover effect for the links */}
                  <span className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 border border-white/50 transition-opacity -z-10" />
                  {item.name}
                </a>
              )}
            </motion.div>
          );
        })}
      </nav>
    </motion.header>
  );
};

export default Header;
