/**
 * Normalizes mathematical Unicode, garbled font characters, surrogate pairs,
 * and unprintable control characters to clean standard ASCII.
 *
 * @param {string} str - Raw text extracted from document/PDF
 * @returns {string} Normalized and cleaned plain text
 */
export function cleanExtractedText(str = "") {
  if (!str) return "";
  return str
    // Normalize compatibility decomposition
    .normalize("NFKD")
    // Map common mathematical styled alphabets back to standard ASCII
    .replace(/[\uD835][\uDC00-\uDFFF]/g, (char) => {
      const codePoint = char.codePointAt(0);
      // Math italic small letters (a-z: 0x1D44E to 0x1D467)
      if (codePoint >= 0x1D44E && codePoint <= 0x1D467) {
        return String.fromCharCode(codePoint - 0x1D44E + 97);
      }
      // Math italic capital letters (A-Z: 0x1D434 to 0x1D44D)
      if (codePoint >= 0x1D434 && codePoint <= 0x1D44D) {
        return String.fromCharCode(codePoint - 0x1D434 + 65);
      }
      return char;
    })
    // Strip unprintable control codes while keeping newlines and standard punctuation
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/[ ]{2,}/g, " ");
}
