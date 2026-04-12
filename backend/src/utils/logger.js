const nowIso = () => new Date().toISOString();
const useColors = process.stdout.isTTY;
let sequence = 0;

const ANSI = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

const colorize = (color, value) => {
  if (!useColors) return value;
  return `${ANSI[color] || ""}${value}${ANSI.reset}`;
};

const nextSequence = () => {
  sequence += 1;
  return String(sequence).padStart(5, "0");
};

const valueToText = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const metaToText = (meta = {}) =>
  Object.entries(meta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${valueToText(value)}`)
    .join(" ");

const levelLabel = (level) => {
  if (level === "error") return colorize("red", "ERROR");
  if (level === "warn") return colorize("yellow", "WARN ");
  if (level === "http") return colorize("magenta", "HTTP ");
  return colorize("green", "INFO ");
};

const writeLine = (line) => {
  process.stdout.write(`${line}\n`);
};

const emit = (level, message, meta = {}) => {
  const seq = colorize("gray", `#${nextSequence()}`);
  const ts = colorize("gray", nowIso());
  const msg = colorize("cyan", message);
  const metaText = metaToText(meta);
  const line = `${seq} ${ts} ${levelLabel(level)} ${msg}${metaText ? ` ${colorize("blue", metaText)}` : ""}`;
  writeLine(line);
};

const statusColor = (statusCode) => {
  if (statusCode >= 500) return "red";
  if (statusCode >= 400) return "yellow";
  if (statusCode >= 300) return "cyan";
  return "green";
};

export const logger = {
  info: (message, meta) => emit("info", message, meta),
  warn: (message, meta) => emit("warn", message, meta),
  error: (message, meta) => emit("error", message, meta),
  http: (message, meta) => emit("http", message, meta),
  request: ({ requestId, method, path, statusCode, durationMs, bytes }) => {
    emit("http", "request", {
      requestId,
      method,
      path,
      status: colorize(statusColor(Number(statusCode) || 0), String(statusCode || "-")),
      durationMs,
      bytes: bytes || 0,
    });
  },
};