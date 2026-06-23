import express from "express";
import { requireAuth } from "../auth/auth.controller.js";
import {
  handleChatMessage,
  createConversation,
  getUserConversations,
  getConversationMessages,
  deleteConversation,
  editChatMessage,
} from "./chat.controller.js";

const router = express.Router();

router.post("/message", requireAuth, handleChatMessage);
router.post("/conversation", requireAuth, createConversation);
router.get("/conversations", requireAuth, getUserConversations);
router.get("/conversations/:conversationId/messages", requireAuth, getConversationMessages);
router.delete("/conversation/:id", requireAuth, deleteConversation);
router.put("/message/:id", requireAuth, editChatMessage);

export default router;
