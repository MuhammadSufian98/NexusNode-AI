"use client";

import React, { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/store/themeStore";

export default function ThemeToggle() {
  const theme = useTheme((state) => state.theme);
  const setTheme = useTheme((state) => state.setTheme);
  const initTheme = useTheme((state) => state.initTheme);

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition-all hover:scale-[1.05] active:scale-[0.96] flex items-center justify-center cursor-pointer shadow-xs shrink-0"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon */}
        <span
          className={`absolute transform transition-all duration-300 flex items-center justify-center ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-50 opacity-0 pointer-events-none"
          }`}
        >
          <Sun size={15} className="text-amber-500" />
        </span>
        
        {/* Moon Icon */}
        <span
          className={`absolute transform transition-all duration-300 flex items-center justify-center ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0 pointer-events-none"
          }`}
        >
          <Moon size={15} className="text-indigo-400" />
        </span>
      </div>
    </button>
  );
}
