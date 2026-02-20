import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import ragRoutes from "./routes/ragRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas & Models Loaded"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("NexusNode AI Backend is running!");
});

// Routes
app.use("/api/rag", ragRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server spinning on http://localhost:${PORT}`);
});
