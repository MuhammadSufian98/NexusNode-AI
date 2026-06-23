import express from "express";
import multer from "multer";
import { requireAuth } from "../auth/auth.controller.js";
import {
  uploadAndProcessPDF,
  searchChunks,
  listDocuments,
  deleteDocument,
} from "./rag.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", requireAuth, upload.single("pdf"), uploadAndProcessPDF);
router.post("/search", requireAuth, searchChunks);
router.get("/documents", requireAuth, listDocuments);
router.delete("/documents/:id", requireAuth, deleteDocument);

export default router;
