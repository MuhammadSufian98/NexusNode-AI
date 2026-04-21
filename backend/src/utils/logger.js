const useColors = process.stdout.isTTY;

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const colorize = (styles, value) => {
  if (!useColors) return value;
  const styleList = Array.isArray(styles) ? styles : [styles];
  const prefix = styleList.map((style) => ANSI[style] || "").join("");
  return `${prefix}${value}${ANSI.reset}`;
};

const nowTime = () => {
  const date = new Date();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
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

const LEVEL_WIDTH = 5;

const levelStyle = (level) => {
  if (level === "error") return ["bold", "red"];
  if (level === "warn") return "yellow";
  if (level === "debug" || level === "db") return "cyan";
  return "green";
};

const levelLabel = (level) => String(level || "info").toUpperCase().padEnd(LEVEL_WIDTH, " ");

const levelSymbol = (level) => {
  if (level === "error") return "✖";
  if (level === "warn") return "!";
  if (level === "debug" || level === "db") return "⚡";
  return "→";
};

const prefixText = (level) => `[${nowTime()}]  ${levelLabel(level)}  ${levelSymbol(level)}  `;

const continuationPrefix = (level) => " ".repeat(prefixText(level).length);

const writeLine = (line) => {
  process.stdout.write(`${line}\n`);
};

const emit = (level, message, meta = {}) => {
  const normalizedLevel = String(level || "info").toLowerCase();
  const ts = colorize(["dim", "gray"], `[${nowTime()}]`);
  const lvl = colorize(levelStyle(normalizedLevel), levelLabel(normalizedLevel));
  const sym = colorize(levelStyle(normalizedLevel), levelSymbol(normalizedLevel));

  const { error, stack, ...restMeta } = meta || {};
  const details = metaToText(restMeta);
  const line = `${ts}  ${lvl}  ${sym}  ${message}${details ? ` (${details})` : ""}`;
  writeLine(line);

  const detailMessage = stack || error;
  if (normalizedLevel === "error" && detailMessage) {
    const firstLine = String(detailMessage).split("\n")[0];
    const subLine = `${continuationPrefix(normalizedLevel)}${colorize("gray", "↳")}  ${firstLine}`;
    writeLine(subLine);
  }
};

const formatDuration = (durationMs) => {
  const safe = Number(durationMs);
  if (!Number.isFinite(safe) || safe < 0) return "0ms";
  const rounded = safe >= 10 ? Math.round(safe) : Number(safe.toFixed(2));
  return `${rounded}ms`;
};

export const logger = {
  info: (message, meta) => emit("info", message, meta),
  warn: (message, meta) => emit("warn", message, meta),
  error: (message, meta) => emit("error", message, meta),
  debug: (message, meta) => emit("debug", message, meta),
  db: (message, meta) => emit("db", message, meta),
  http: (message, meta) => emit("info", message, meta),
  request: ({ method, path, statusCode, durationMs }) => {
    const requestMessage = `${method || "-"} ${path || "-"} ${statusCode || "-"} (${formatDuration(durationMs)})`;
    emit("info", requestMessage);
  },
};