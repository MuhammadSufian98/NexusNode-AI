import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./src/auth/auth.routes.js";
import ragRoutes from "./src/rag/rag.routes.js";
import User from "./src/auth/auth.model.js";
import TempCode from "./src/auth/tempCode.model.js";
import Document from "./src/rag/documents.model.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "NexusNode";

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: MONGO_DB_NAME,
  })
  .then(() => {
    const activeDbName = mongoose.connection.name;
    console.log(`🍃 Connected to MongoDB Atlas | DB: ${activeDbName}`);
    console.log(
      `📚 Active collections -> users: ${User.collection.name}, tempCodes: ${TempCode.collection.name}, documents: ${Document.collection.name}`,
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "NexusNode AI Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rag", ragRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🧭 Expected Mongo DB name: ${MONGO_DB_NAME}`);
});
