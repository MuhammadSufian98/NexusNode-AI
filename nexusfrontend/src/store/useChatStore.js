"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";
import { chatApi } from "@/services/chatApi";
import { useDocumentStore } from "./useDocumentStore";
import {
  formatMessage,
  formatConversation,
  createInitialMessage,
  createInitialConversation,
} from "@/types/schemas";

/**
 * Domain store for Chat, Conversations, and Neural Citations
 */
export const useChatStore = create((set, get) => ({
  messages: [],
  conversationsList: [],
  conversations: [], // Alias for conversationsList
  activeConversationId: null,
  conversationId: null, // Alias for activeConversationId
  isProcessing: false,
  abortController: null,

  // Direct Setters
  setMessages: (messages) => set({ messages }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setActiveConversationId: (id) =>
    set({ activeConversationId: id, conversationId: id }),

  clearMessages: () => set({ messages: [] }),

  resetChatState: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
    }
    set({
      messages: [],
      conversationId: null,
      activeConversationId: null,
      conversations: [],
      conversationsList: [],
      abortController: null,
      isProcessing: false,
    });
  },

  // 1. Cancel in-flight generation
  cancelGeneration: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
      set({ abortController: null, isProcessing: false });
      toast.success("Generation stopped.");
    }
  },

  // 2. Send Chat Message
  sendMessage: async (text, documentId = null) => {
    if (!text || !text.trim()) return;

    const targetDocId =
      documentId ||
      useDocumentStore.getState().selectedDocument?.id ||
      useDocumentStore.getState().selectedDocument?._id;

    if (!targetDocId) {
      toast.error("Please select a document first.");
      return;
    }

    let currentConvId = get().activeConversationId || get().conversationId;

    if (!currentConvId) {
      const newSession = await get().createChatSession(targetDocId);
      currentConvId = newSession?.id || newSession?._id;
      if (!currentConvId) {
        toast.error("Could not establish a chat session.");
        return;
      }
    }

    if (get().abortController) {
      get().abortController.abort();
    }

    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `assistant_${Date.now() + 1}`;

    const userMsg = createInitialMessage({
      id: userMsgId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    });

    const assistantPlaceholder = createInitialMessage({
      id: assistantMsgId,
      role: "assistant",
      content: "",
      citations: [],
      createdAt: new Date().toISOString(),
    });

    set((state) => ({
      messages: [...state.messages, userMsg, assistantPlaceholder],
      isProcessing: true,
    }));

    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const data = await chatApi.sendMessage({
        message: text,
        conversationId: currentConvId,
        documentId: targetDocId,
        signal: controller.signal,
      });

      const answer =
        data.assistantMessage?.content ||
        data.answer ||
        "No response generated.";

      const rawCitations =
        data.assistantMessage?.citations || data.citations || [];
      const citations = rawCitations.map((c) => ({
        documentId: c.documentId || documentId || "",
        fileName: c.fileName || "Document.pdf",
        pageNumber: c.pageNumber || 1,
        textSnippet: c.textSnippet || c.snippet || "",
        snippet: c.snippet || c.textSnippet || "",
      }));

      const finalConvId =
        data.conversationId || data.sessionId || currentConvId;

      set((state) => {
        const updatedConversations = state.conversationsList.map((c) =>
          c._id === finalConvId || c.id === finalConvId
            ? {
                ...c,
                lastMessage: text.slice(0, 50),
                updatedAt: new Date().toISOString(),
              }
            : c
        );

        return {
          conversationId: finalConvId,
          activeConversationId: finalConvId,
          messages: state.messages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  id: data.assistantMessage?._id || data.assistantMessage?.id || assistantMsgId,
                  _id: data.assistantMessage?._id || data.assistantMessage?.id || assistantMsgId,
                  content: answer,
                  citations: citations,
                }
              : msg
          ),
          conversationsList: updatedConversations,
          conversations: updatedConversations,
        };
      });

      toast.success("Insight retrieved!");
    } catch (error) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== assistantMsgId),
        }));
      } else {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `Error: ${error.message || "Request failed"}`,
                }
              : msg
          ),
        }));
        toast.error(error.message || "Failed to send message");
      }
    } finally {
      set({ isProcessing: false, abortController: null });
    }
  },

  // 3. Create Chat Session
  createChatSession: async (documentId = null, title = "New Conversation") => {
    const targetDocId =
      documentId ||
      useDocumentStore.getState().selectedDocument?.id ||
      useDocumentStore.getState().selectedDocument?._id;

    if (!targetDocId || targetDocId === "undefined") {
      toast.error("Please select a document first to start a chat session.");
      return null;
    }

    set({ isProcessing: true });
    try {
      const payload = await chatApi.createConversation(targetDocId, title);
      const rawConv = payload.conversation || payload.session || {
        _id: payload.conversationId,
        id: payload.conversationId,
        documentId: targetDocId,
        title,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const newConv = formatConversation(rawConv);
      const newConvId = newConv.id || newConv._id;

      set((state) => {
        const filteredList = state.conversationsList.filter(
          (c) => c._id !== newConvId && c.id !== newConvId
        );
        const updatedList = [newConv, ...filteredList];

        return {
          activeConversationId: newConvId,
          conversationId: newConvId,
          conversations: updatedList,
          conversationsList: updatedList,
          messages: [],
          isProcessing: false,
        };
      });

      toast.success("New chat initialized!");
      return newConv;
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to start new chat");
      return null;
    }
  },

  // Aliases for compatibility
  createNewChatSession: async (documentId, title) =>
    get().createChatSession(documentId, title),
  createSession: async (documentId, title) =>
    get().createChatSession(documentId, title),

  // 4. Load Conversation Threads for Document
  loadUserChatThreads: async (documentId = null) => {
    try {
      const targetDocId =
        documentId ||
        useDocumentStore.getState().selectedDocument?.id ||
        useDocumentStore.getState().selectedDocument?._id;

      const data = await chatApi.getConversations(targetDocId);
      const rawList = Array.isArray(data)
        ? data
        : data.conversations || data.sessions || [];
      const list = rawList.map((c) => formatConversation(c));

      set({
        conversationsList: list,
        conversations: list,
      });

      if (list.length > 0 && !get().activeConversationId) {
        const firstThreadId = list[0].id || list[0]._id;
        await get().selectChatSession(firstThreadId);
      } else if (list.length === 0) {
        set({
          activeConversationId: null,
          conversationId: null,
          messages: [],
        });
      }
      return list;
    } catch (error) {
      toast.error(error.message || "Failed to load chat history");
      return [];
    }
  },

  // 5. Select and Load Specific Conversation Messages
  selectChatSession: async (conversationId) => {
    if (!conversationId) return;

    set({
      activeConversationId: conversationId,
      conversationId: conversationId,
      messages: [],
      isProcessing: true,
    });

    try {
      const data = await chatApi.getMessages(conversationId);
      const rawMessages = Array.isArray(data) ? data : data.messages || [];
      const mapped = rawMessages.map((msg) => formatMessage(msg));

      mapped.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );

      set({
        messages: mapped,
        isProcessing: false,
      });
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to load message history");
    }
  },

  // Aliases for compatibility
  loadSessionMessages: async (conversationId) =>
    get().selectChatSession(conversationId),
  loadConversationMessages: async (conversationId) =>
    get().selectChatSession(conversationId),

  // 6. Delete Chat Session
  deleteChatSession: async (conversationId, documentId = null) => {
    try {
      await chatApi.deleteConversation(conversationId);
      const activeId = get().activeConversationId;

      if (activeId === conversationId) {
        set({
          activeConversationId: null,
          conversationId: null,
          messages: [],
        });
      }

      if (documentId) {
        await get().loadUserChatThreads(documentId);
      } else {
        set((state) => {
          const updated = state.conversationsList.filter(
            (c) => c.id !== conversationId && c._id !== conversationId
          );
          return {
            conversationsList: updated,
            conversations: updated,
          };
        });
      }

      toast.success("Chat deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to delete chat session");
      return false;
    }
  },

  // 7. Edit Message
  editMessagePrompt: async (messageId, newContent, documentId = null) => {
    try {
      set({ isProcessing: true });
      await chatApi.editMessage(messageId, newContent);

      const activeId = get().activeConversationId;
      if (activeId) {
        await get().selectChatSession(activeId);
      }

      if (documentId) {
        await get().loadUserChatThreads(documentId);
      }

      set({ isProcessing: false });
      toast.success("Message updated!");
      return true;
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to edit chat message");
      return false;
    }
  },
}));

export default useChatStore;
