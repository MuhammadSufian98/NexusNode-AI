import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth/auth.controller.js";
import {
  uploadAndProcessPDF,
  expandVectorTier,
  searchChunks,
  listDocuments,
  deleteDocument,
  streamDocumentPdf,
  getDocumentPagePreview,
} from "./rag.controller.js";

const router = Router();

// Multer upload middleware wrapper with security constraints
const uploadSinglePDF = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "application/pdf") {
        return cb(
          new Error(
            "MIME_TYPE_VALIDATION_FAILED: Only PDF documents are allowed.",
          ),
        );
      }
      cb(null, true);
    },
  }).single("pdf");

  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File size limit exceeded. Maximum size allowed is 10MB.",
          message: "File size limit exceeded. Maximum size allowed is 10MB.",
        });
      }
      if (
        err.message &&
        err.message.startsWith("MIME_TYPE_VALIDATION_FAILED")
      ) {
        const msg = err.message.split(": ")[1];
        return res.status(400).json({ error: msg, message: msg });
      }
      return res.status(400).json({
        error: err.message || "File upload failed.",
        message: err.message || "File upload failed.",
      });
    }
    next();
  });
};

router.post("/upload", requireAuth, uploadSinglePDF, uploadAndProcessPDF);
router.post("/documents/:id/expand-vector-tier", requireAuth, expandVectorTier);
router.post("/search", requireAuth, searchChunks);
router.get("/documents", requireAuth, listDocuments);
// Page-specific Cloudinary image rasterization endpoint
router.get("/documents/:id/page-preview", requireAuth, getDocumentPagePreview);
// Neutral preview endpoint (does not end in .pdf to avoid IDM URL pattern matching)
router.get("/documents/:id/preview-stream", requireAuth, streamDocumentPdf);
router.get("/documents/:id/view-pdf", requireAuth, streamDocumentPdf);
router.delete("/documents/:id", requireAuth, deleteDocument);

export default router;
