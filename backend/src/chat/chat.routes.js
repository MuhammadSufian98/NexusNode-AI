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

// 1. Chat Message Dispatch (REST Endpoint)
router.post("/message", requireAuth, handleChatMessage);
router.post("/messages", requireAuth, handleChatMessage);

// 2. Create Conversation / Session (Plural, Singular & Session aliases)
router.post("/conversations", requireAuth, createConversation);
router.post("/conversation", requireAuth, createConversation);
router.post("/sessions", requireAuth, createConversation);
router.post("/session", requireAuth, createConversation);

// 3. List Conversations / Sessions for User / Document
router.get("/conversations", requireAuth, getUserConversations);
router.get("/sessions", requireAuth, getUserConversations);

// 4. Get Messages for a specific Conversation / Session
router.get(
  "/conversations/:conversationId/messages",
  requireAuth,
  getConversationMessages,
);
router.get(
  "/sessions/:sessionId/messages",
  requireAuth,
  getConversationMessages,
);

// 5. Delete Conversation / Session
router.delete("/conversations/:id", requireAuth, deleteConversation);
router.delete("/sessions/:id", requireAuth, deleteConversation);

// 6. Edit Message
router.put("/message/:id", requireAuth, editChatMessage);
router.put("/messages/:id", requireAuth, editChatMessage);

export default router;
