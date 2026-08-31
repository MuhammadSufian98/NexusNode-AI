/**
 * @file Data formatting utilities for byte sizes, dates, and text truncation.
 */

/**
 * Format bytes into human-readable strings (e.g. "1.2 MB", "450 KB")
 * @param {number|string} bytes - Number of bytes
 * @param {number} [decimals=1] - Decimal precision
 * @returns {string} Formatted size string
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === undefined || bytes === null || isNaN(Number(bytes))) return "0 KB";
  const numBytes = Number(bytes);
  if (numBytes === 0) return "0 KB";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  const formatted = parseFloat((numBytes / Math.pow(k, safeIndex)).toFixed(dm));

  return `${formatted} ${sizes[safeIndex]}`;
}

/**
 * Formats a Date or ISO string into a localized readable date
 * @param {Date|string|number} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Intl format options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return d.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats a Date or ISO string into localized time
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Formats relative time (e.g. "2 mins ago", "1 hour ago", "Yesterday")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSeconds < 60) return "Just now";
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffSeconds < 172800) return "Yesterday";
  return formatDate(d);
}

/**
 * Truncates text with trailing ellipsis
 * @param {string} text - Input text
 * @param {number} [max=50] - Maximum allowed length
 * @param {string} [ellipsis="..."] - Ellipsis indicator
 * @returns {string} Truncated string
 */
export function truncateText(text, max = 50, ellipsis = "...") {
  if (!text || typeof text !== "string") return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}${ellipsis}`;
}

export const formatters = {
  formatBytes,
  formatDate,
  formatTime,
  formatRelativeTime,
  truncateText,
};

export default formatters;
