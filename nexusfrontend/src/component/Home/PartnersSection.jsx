"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LAYERS = [
  {
    id: 0,
    title: "NexusNode Synthesis Studio",
    desc: "Interactive workspace orchestrating multimodal document analysis, verified semantic search, and multi-turn active recall generation across complex syllabi and reading packets.",
    plateLabel: "NexusNode Agent Studio",
    labelColor: "text-white/90",
    topBg: "bg-gradient-to-br from-[#363B42] to-[#202428]",
    frontWallBg: "bg-[#14171A]",
    rightWallBg: "bg-[#0B0D0F]",
    dotPattern:
      "radial-gradient(circle, rgba(255,255,255,0.22) 1.2px, transparent 1.2px)",
    shadow: "shadow-[0_35px_60px_-15px_rgba(15,23,42,0.6)]",
    tools: [
      {
        name: "Gemini",
        bg: "bg-[#0E80E5]",
        icon: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
        isLightSvg: true,
      },
      {
        name: "HubSpot",
        bg: "bg-[#FF5C35]",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
        isLightSvg: true,
      },
      {
        name: "Salesforce",
        bg: "bg-[#00A1E0]",
        icon: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
        isLightSvg: true,
      },
      {
        name: "Adobe",
        bg: "bg-[#ED2224]",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg",
        isLightSvg: false,
      },
      {
        name: "Analytics",
        bg: "bg-[#F7B928]",
        icon: "https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg",
        isLightSvg: false,
      },
      {
        name: "Klaviyo",
        bg: "bg-[#FF6A55]",
        icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg",
        isLightSvg: true,
      },
      {
        name: "Cohere",
        bg: "bg-[#6A3BE2]",
        icon: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
        isLightSvg: true,
      },
      {
        name: "Braze",
        bg: "bg-[#4D179A]",
        text: "braze",
        textColor: "text-white",
      },
    ],
  },
  {
    id: 1,
    title: "NexusNode Decisioning",
    desc: "Real-time cosine vector matching and Top-K citation validation ensuring 0% hallucination. Binds every synthetic explanation and card back to exact PDF coordinate offsets.",
    plateLabel: "NexusNode Decisioning",
    labelColor: "text-white/95",
    topBg: "bg-gradient-to-br from-[#1A75FF] to-[#0055E6]",
    frontWallBg: "bg-[#003EA3]",
    rightWallBg: "bg-[#002B7A]",
    dotPattern:
      "radial-gradient(circle, rgba(255,255,255,0.3) 1.2px, transparent 1.2px)",
    shadow: "shadow-[0_35px_65px_-15px_rgba(0,102,255,0.55)]",
  },
  {
    id: 2,
    title: "Data & Context",
    desc: "Unifies raw PDF textbooks, lecture audio transcripts, handwritten OCR scans, and syllabi into an in-memory 512-dimensional vector thought graph updated on every run.",
    plateLabel: "Data & Context",
    labelColor: "text-slate-800",
    topBg: "bg-gradient-to-br from-[#FAF9F5] to-[#EBE7DC]",
    frontWallBg: "bg-[#C8C2B4]",
    rightWallBg: "bg-[#AEA798]",
    dotPattern:
      "radial-gradient(circle, rgba(0,0,0,0.08) 1.2px, transparent 1.2px)",
    shadow: "shadow-[0_30px_50px_-15px_rgba(0,0,0,0.22)]",
  },
];

export default function PartnersSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const activeIndex = hoveredIndex ?? 0;

  return (
    <section className="relative z-10 w-full py-20 sm:py-28 lg:py-36 bg-[var(--color-canvas)] select-none border-b border-[var(--color-border)] overflow-hidden font-['PP_Neue_Montreal',Arial,sans-serif]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 lg:pb-24 border-b border-slate-200/80">
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-slate-950 leading-[1.08]">
              The intelligence stack, <br />
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
                modernized.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <p className="text-slate-600 font-normal leading-relaxed text-base sm:text-lg">
              NexusNode AI replaces fragmented manual workflows, integrates
              disparate document formats, and converts static reading into
              automated, 1:1 verified mastery artifacts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-16 lg:pt-20">
          <div className="lg:col-span-6 flex items-center justify-center min-h-[480px] sm:min-h-[540px]">
            <div
              className="relative w-[360px] sm:w-[440px] h-[360px] sm:h-[420px]"
              style={{ perspective: "1400px" }}
            >
              {LAYERS.map((layer, idx) => {
                const isHovered = hoveredIndex === idx;
                const isAbove = hoveredIndex !== null && idx < hoveredIndex;
                const isBelow = hoveredIndex !== null && idx > hoveredIndex;

                let opacity = 1;
                let blurAmount = 0;

                if (isAbove) {
                  opacity = 0.08;
                  blurAmount = 7;
                } else if (isBelow) {
                  opacity = 0.38;
                  blurAmount = 2.5;
                }

                const baseOffsets = [
                  { y: -72, z: 85 },
                  { y: 32, z: 0 },
                  { y: 136, z: -85 },
                ];

                const currentBase = baseOffsets[idx];
                const activeY = isHovered ? currentBase.y - 30 : currentBase.y;

                return (
                  <motion.div
                    key={layer.id}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    animate={{
                      y: activeY,
                      opacity: opacity,
                      filter: `blur(${blurAmount}px)`,
                      scale: isHovered ? 1.035 : 1,
                    }}
                    transition={{
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      rotateX: 58,
                      rotateZ: -42,
                      zIndex: isHovered ? 40 : 30 - idx,
                    }}
                    className="absolute inset-0 m-auto w-[310px] sm:w-[350px] h-[210px] sm:h-[235px] cursor-pointer"
                  >
                    <div
                      className={`absolute top-0 right-0 w-[14px] h-full origin-right ${layer.rightWallBg}`}
                      style={{
                        transform: "rotateY(90deg) translateZ(0px)",
                        borderTopRightRadius: "30px",
                        borderBottomRightRadius: "30px",
                      }}
                    />

                    <div
                      className={`absolute bottom-0 left-0 w-full h-[14px] origin-bottom ${layer.frontWallBg}`}
                      style={{
                        transform: "rotateX(-90deg) translateZ(0px)",
                        borderBottomLeftRadius: "30px",
                        borderBottomRightRadius: "30px",
                      }}
                    />

                    <div
                      className={`relative w-full h-full rounded-[30px] p-5 flex flex-col justify-between overflow-hidden transition-shadow duration-700 ${layer.topBg} ${layer.shadow}`}
                    >
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[30px]"
                        style={{
                          backgroundImage: layer.dotPattern,
                          backgroundSize: "13px 13px",
                        }}
                      />

                      {layer.tools ? (
                        <div className="relative z-10 grid grid-cols-3 gap-2.5 max-w-[215px] pt-1">
                          {layer.tools.map((tool, tIdx) => (
                            <div
                              key={tIdx}
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${tool.bg} shadow-[0_6px_14px_rgba(0,0,0,0.22)] flex items-center justify-center p-2 border border-black/5 transition-transform duration-300 hover:scale-105`}
                            >
                              {tool.text ? (
                                <span
                                  className={`text-[10px] font-bold font-sans italic tracking-tighter ${tool.textColor}`}
                                >
                                  {tool.text}
                                </span>
                              ) : (
                                <img
                                  src={tool.icon}
                                  alt={tool.name}
                                  className={`w-full h-full object-contain ${
                                    tool.isLightSvg
                                      ? "filter brightness-0 invert"
                                      : ""
                                  }`}
                                  loading="lazy"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full flex-1" />
                      )}

                      <div className="relative z-10 w-full flex justify-end pb-1 pr-1">
                        <span
                          className={`text-xs sm:text-[13px] font-sans font-medium tracking-tight ${layer.labelColor}`}
                        >
                          {layer.plateLabel}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8 lg:pl-10">
            <div className="pb-1">
              <p className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                ONE PLATFORM, THREE LAYERS — BUILT FOR THE AGENTIC LEARNER
              </p>
            </div>

            <div className="space-y-4">
              {LAYERS.map((layer, idx) => {
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={layer.id}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer py-2 transition-all duration-400 ease-out"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-xs transition-colors duration-400 ease-out ${
                          isActive ? "bg-slate-950" : "bg-slate-300"
                        }`}
                      />
                      <h3
                        className={`text-lg sm:text-xl font-bold transition-colors duration-400 ease-out ${
                          isActive ? "text-slate-950" : "text-slate-400"
                        }`}
                      >
                        {layer.title}
                      </h3>
                    </div>

                    <div className="pl-5.5 overflow-hidden">
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{
                              duration: 0.5,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed pt-2.5 pb-1">
                              {layer.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
