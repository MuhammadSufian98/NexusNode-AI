import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Route Imports
import authRoutes from "./src/auth/auth.routes.js";
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

// --- CORS STRATEGY ---
const ALLOWED_ORIGINS = (process.env.FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow internal/server-to-server (no origin)
    if (!origin) return callback(null, true);

    // 2. Check Whitelist or Render Preview URLs
    const isWhitelisted = ALLOWED_ORIGINS.includes(origin);
    const isRenderPreview = /^https:\/\/.*\.onrender\.com$/.test(origin);

    if (isWhitelisted || isRenderPreview) {
      callback(null, true);
    } else {
      console.error(`🛑 CORS Blocked: ${origin}`);
      callback(new Error(`CORS policy does not allow access from ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// --- MIDDLEWARE ---
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });

    console.log("------------------------------------------------");
    console.log(
      `🍃 DATABASE: Connected to Atlas | [${mongoose.connection.name}]`,
    );
    console.log(
      `📊 STATUS: users(${User.collection.name}), docs(${Document.collection.name})`,
    );
    console.log("------------------------------------------------");
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
app.use("/api/rag", ragRoutes);

// Root Fallback
app.get("/", (req, res) => {
  res.json({ project: "NexusNode AI", version: "1.0.0", status: "active" });
});

// --- SERVER START ---
const startServer = async () => {
  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`🚀 NEXUSNODE CORE LIVE`);
    console.log(`📡 URL: http://${HOST}:${PORT}`);
    console.log(`🌍 MODE: ${APP_ENV.toUpperCase()}`);
    console.log(`🛡️  CORS: ${ALLOWED_ORIGINS.join(" | ")}`);
    console.log("------------------------------------------------");
  });
};

startServer();
