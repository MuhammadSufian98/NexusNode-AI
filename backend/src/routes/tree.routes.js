import express from "express";
import { requireAuth } from "../auth/auth.controller.js";
import {
  buildSingleDocumentTree,
  buildGlobalMasterTree,
  getGeneratedTreeIds,
} from "../controllers/tree.controller.js";

const router = express.Router();

router.get("/ids", requireAuth, getGeneratedTreeIds);
router.post("/global", requireAuth, buildGlobalMasterTree);
router.post("/:documentId", requireAuth, buildSingleDocumentTree);

export default router;
