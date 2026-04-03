"use client";

import { motion } from "framer-motion";
import { useId } from "react";

export default function GlassButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...rest
}) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;

  const variantStyles = {
    primary: "border-blue-400/40 text-blue-700 shadow-blue-200/20",
    secondary: "border-slate-400/40 text-slate-700 shadow-slate-200/20",
    accent: "border-purple-400/40 text-purple-700 shadow-purple-200/20",
  };

  const bgStyles = {
    primary: "bg-blue-500/10 group-hover:bg-blue-500/20",
    secondary: "bg-slate-500/10 group-hover:bg-slate-500/20",
    accent: "bg-purple-500/10 group-hover:bg-purple-500/20",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        group relative px-8 py-3 rounded-xl border font-bold
        transition-all duration-300 ease-out
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        backdropFilter: `url(#${filterId}) saturate(1.5)`,
        WebkitBackdropFilter: `url(#${filterId}) saturate(1.5)`,
      }}
      {...rest}
    >
      <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
            //   values="1 0 0 0 0  
            //           0 1 0 0 0  
            //           0 0 1 0 0  
            //           0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className={`absolute inset-0 transition-colors duration-500 rounded-[inherit] ${bgStyles[variant]}`}
      />

      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 translate-x-[-150%] skew-x-[-30deg] bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
      </div>

      <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(0,0,0,0.05)]" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
