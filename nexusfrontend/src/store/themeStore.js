import { create } from "zustand";

export const PALETTES = {
  // 1. Signature NexusNode AI (Recommended Premium Default)
  nexusWarm: {
    id: "nexus-warm",
    name: "Nexus Obsidian & Warm Sunset",
    main: "#E11D48",        // Primary Rose 600
    mainHover: "#BE123C",   // Rose 700
    mid: "#F97316",         // Orange 500
    highlight: "#F59E0B",   // Amber 500
    accentSuccess: "#10B981",// Emerald 500 (Truth/Grounding)
    bgCanvas: "#FAF9F6",    // Editorial Soft Linen
    bgSurface: "#FFFFFF",
    borderBase: "rgba(226, 232, 240, 0.8)",
    textPrimary: "#0F172A",
    textMuted: "#64748B",
    glowShadow: "rgba(225, 29, 72, 0.15)",
  },

  // 2. The Golden Angle Palette (If you want to test the generated complementary look)
  calculatedComplementary: {
    id: "calculated-comp",
    name: "Calculated Complementary",
    main: "#E11D48",
    mainHover: "#C0163B",
    mid: "#946B74",
    highlight: "#1DE12D",
    accentSuccess: "#0E7117",
    bgCanvas: "#FBF9FA",
    bgSurface: "#FFFFFF",
    borderBase: "rgba(148, 107, 116, 0.2)",
    textPrimary: "#1C1416",
    textMuted: "#946B74",
    glowShadow: "rgba(225, 29, 72, 0.18)",
  },

  // 3. Cyber Obsidian (Monochrome Deep Dark Mode)
  cyberObsidian: {
    id: "cyber-obsidian",
    name: "Cyber Obsidian Dark",
    main: "#F43F5E",
    mainHover: "#E11D48",
    mid: "#FB923C",
    highlight: "#FBBF24",
    accentSuccess: "#34D399",
    bgCanvas: "#09090B",
    bgSurface: "#18181B",
    borderBase: "rgba(39, 39, 42, 0.8)",
    textPrimary: "#F8FAFC",
    textMuted: "#94A3B8",
    glowShadow: "rgba(244, 63, 94, 0.22)",
  },
};

export const useThemeStore = create((set, get) => ({
  activePaletteKey: "nexusWarm",
  palette: PALETTES.nexusWarm,

  // Set predefined palette
  setPalette: (paletteKey) => {
    const nextPalette = PALETTES[paletteKey] || PALETTES.nexusWarm;
    set({ activePaletteKey: paletteKey, palette: nextPalette });
    get().applyCssVariables(nextPalette);
  },

  // Custom live token adjustments
  updateCustomToken: (tokenKey, value) => {
    const updated = { ...get().palette, [tokenKey]: value };
    set({ palette: updated });
    get().applyCssVariables(updated);
  },

  // Injects CSS variables onto :root for universal CSS / Tailwind use
  applyCssVariables: (tokens) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--color-main", tokens.main);
    root.style.setProperty("--color-main-hover", tokens.mainHover);
    root.style.setProperty("--color-mid", tokens.mid);
    root.style.setProperty("--color-highlight", tokens.highlight);
    root.style.setProperty("--color-success", tokens.accentSuccess);
    root.style.setProperty("--color-canvas", tokens.bgCanvas);
    root.style.setProperty("--color-surface", tokens.bgSurface);
    root.style.setProperty("--color-border", tokens.borderBase);
    root.style.setProperty("--color-text-primary", tokens.textPrimary);
    root.style.setProperty("--color-text-muted", tokens.textMuted);
    root.style.setProperty("--color-glow", tokens.glowShadow);
  },
}));