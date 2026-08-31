/**
 * @file Text sanitization, markdown stripping, and math cleaner helpers for previews and tooltips.
 */

/**
 * Strips LaTeX / KaTeX math blocks and symbols for clean text previews
 * @param {string} text - Text containing LaTeX syntax
 * @returns {string} Cleaned plain-text string
 */
export function cleanMathSyntax(text) {
  if (!text || typeof text !== "string") return "";

  return text
    // Remove display math $$...$$
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    // Remove inline math $...$
    .replace(/\$([^\$\n]+?)\$/g, "$1")
    // Clean basic LaTeX commands like \frac{a}{b} -> a/b
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    // Remove LaTeX command wrappers like \textbf{...}, \mathrm{...}
    .replace(/\\[a-zA-Z]+\{([^}]+)\}/g, "$1")
    // Strip leftover backslashes before math symbols
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .trim();
}

/**
 * Sanitizes markdown content by removing markup formatting to produce a clean snippet
 * @param {string} markdownText - Raw markdown text
 * @param {number} [maxLen=120] - Maximum snippet length
 * @returns {string} Clean plain-text preview
 */
export function sanitizeMarkdownPreview(markdownText, maxLen = 120) {
  if (!markdownText || typeof markdownText !== "string") return "";

  let cleaned = markdownText
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove HTML tags
    .replace(/<[^>]+>/g, "")
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Remove headings # Header
    .replace(/^#{1,6}\s+/gm, "")
    // Remove blockquotes > Quote
    .replace(/^>\s+/gm, "")
    // Remove bold and italic markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, "$1")
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // Remove extra whitespace & newlines
    .replace(/\s+/g, " ")
    .trim();

  // Clean any math syntax
  cleaned = cleanMathSyntax(cleaned);

  if (maxLen && cleaned.length > maxLen) {
    cleaned = `${cleaned.slice(0, maxLen).trimEnd()}...`;
  }

  return cleaned;
}

/**
 * Extracts raw plain text recursively from React component children
 * @param {any} children - React children prop
 * @returns {string} Extracted text
 */
export function extractRawText(children) {
  if (!children) return "";
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractRawText).join("");
  if (children?.props?.children) return extractRawText(children.props.children);
  return "";
}

export const textSanitizers = {
  cleanMathSyntax,
  sanitizeMarkdownPreview,
  extractRawText,
};

export default textSanitizers;
