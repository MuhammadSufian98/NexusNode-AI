/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        surface: "var(--bg-surface)",
        borderPrimary: "var(--border-primary)",
        borderHighlight: "var(--border-highlight)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        accent: "var(--accent-primary)",
        accentHover: "var(--accent-hover)",
        userBubble: "var(--user-bubble-bg)",
        userBubbleText: "var(--user-bubble-text)",
        assistantBubble: "var(--assistant-bubble-bg)",
        assistantBorder: "var(--assistant-bubble-border)",
        assistantText: "var(--assistant-bubble-text)",
        citationCard: "var(--citation-card-bg)",
        citationBorder: "var(--citation-card-border)",
        citationBadge: "var(--citation-badge)",
        codeBlock: "var(--code-block-bg)",
      },
    },
  },
  plugins: [],
};
