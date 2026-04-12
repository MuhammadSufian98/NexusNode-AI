import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import crypto from "crypto";

// Route Imports
import authRoutes from "./src/auth/auth.routes.js";
import profileRoutes from "./src/profile/profile.routes.js";
import ragRoutes from "./src/rag/rag.routes.js";
import { notFoundHandler, errorHandler } from "./src/middleware/error.middleware.js";
import { logger } from "./src/utils/logger.js";

// Model Imports (for logging verification)
import User from "./src/auth/auth.model.js";
import TempCode from "./src/auth/tempCode.model.js";
import Document from "./src/rag/documents.model.js";

const app = express();

// --- CONFIGURATION ---
const PORT = Number(process.env.PORT) || 10000;
const HOST = "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "NexusNode";
const APP_ENV = (process.env.APP_ENV || "development").toLowerCase();

const internalLog = (...args) => logger.info("internal", { message: args.join(" ") });

// --- CORS STRATEGY ---
const normalizeOrigin = (value = "") => value.replace(/\/+$/, "");

const ALLOWED_ORIGINS = (process.env.FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const isAllowedOrigin = (origin = "") => {
  const cleanedOrigin = normalizeOrigin(origin);

  if (!cleanedOrigin) return false;

  if (ALLOWED_ORIGINS.includes(cleanedOrigin)) {
    return true;
  }

  return /\.vercel\.app$/.test(cleanedOrigin) || /\.onrender\.com$/.test(cleanedOrigin);
};

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow internal/server-to-server (no origin)
    if (!origin) return callback(null, true);

    const cleanedOrigin = normalizeOrigin(origin);

    if (isAllowedOrigin(cleanedOrigin)) {
      callback(null, true);
    } else {
      logger.warn("cors_blocked", { origin: cleanedOrigin });
      callback(
        new Error(`CORS policy does not allow access from ${cleanedOrigin}`),
      );
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
  maxAge: 60 * 60,
};

// --- MIDDLEWARE ---
app.use(helmet());
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.request({
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      bytes: res.getHeader("content-length") || 0,
    });
  });

  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });

    internalLog("------------------------------------------------");
    internalLog(
      `🍃 DATABASE: Connected to Atlas | [${mongoose.connection.name}]`,
    );
    internalLog(
      `📊 STATUS: users(${User.collection.name}), docs(${Document.collection.name})`,
    );
    internalLog("------------------------------------------------");
  } catch (err) {
    logger.error("mongodb_connect_failed", { error: err.message });
    process.exit(1);
  }
};

// --- ROUTES ---
app.get("/health", (req, res) =>
  res.status(200).json({ status: "healthy", env: APP_ENV }),
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rag", ragRoutes);

// Root Fallback
app.get("/", (req, res) => {
  res.json({ project: "NexusNode AI", version: "1.0.0", status: "active" });
});

app.use(notFoundHandler);
app.use(errorHandler);

// --- SERVER START ---
const startServer = async () => {
  await connectDB();

  app.listen(PORT, HOST, () => {
    internalLog(`🚀 NEXUSNODE CORE LIVE`);
    internalLog(`📡 URL: http://${HOST}:${PORT}`);
    internalLog(`🌍 MODE: ${APP_ENV.toUpperCase()}`);
    internalLog(`🛡️  CORS: ${ALLOWED_ORIGINS.join(" | ")}`);
    internalLog("------------------------------------------------");
  });
};

startServer();

process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", {
    error: error?.message || "Unknown uncaught exception",
  });
});
