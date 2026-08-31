import express from "express";
import { requireAuth } from "../../auth/auth.controller.js";
import {
  getSettingsConfig,
  updateNeuralKey,
  purgeChatHistory,
  reindexWorkspaceAssets,
  purgeAllVaultData,
} from "../../controllers/settings.controller.js";

const router = express.Router();

router.get("/config", requireAuth, getSettingsConfig);
router.put("/neural-keys", requireAuth, updateNeuralKey);
router.delete("/vault/chat-history", requireAuth, purgeChatHistory);
router.post("/vault/reindex", requireAuth, reindexWorkspaceAssets);
router.delete("/vault/purge-all", requireAuth, purgeAllVaultData);

export default router;
