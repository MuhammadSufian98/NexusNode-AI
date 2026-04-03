import express from "express";
import multer from "multer";
import { uploadAndProcessPDF, searchChunks } from "./rag.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("pdf"), uploadAndProcessPDF);
router.post("/search", searchChunks);

export default router;
