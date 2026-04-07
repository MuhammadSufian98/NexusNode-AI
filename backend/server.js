import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// Route Imports
import authRoutes from "./src/auth/auth.routes.js";
import profileRoutes from "./src/profile/profile.routes.js";
import ragRoutes from "./src/rag/rag.routes.js";

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

const internalLog = (...args) => console.log("[INTERNAL]", ...args);

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
      console.error(`[CORS][BLOCKED] ${cleanedOrigin}`);
      callback(
        new Error(`CORS policy does not allow access from ${cleanedOrigin}`),
      );
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// --- MIDDLEWARE ---
app.use(helmet());
app.use(morgan("dev"));
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
    console.error("❌ MONGODB ERROR:", err.message);
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
