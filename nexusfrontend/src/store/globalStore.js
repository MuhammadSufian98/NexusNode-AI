"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";
import { ragApi, chatApi, overviewApi } from "@/utils/apiServices";

export const useGlobal = create((set, get) => ({
  activeSection: "dashboard",
  sidebarOpen: false,
  isUploading: false,
  documents: [],
  selectedDocument: null,
  messages: [],
  conversationId: null,
  activeConversationId: null,
  conversationsList: [],
  conversations: [],
  isProcessing: false,
  activeTreeData: null,
  isTreeModalOpen: false,
  generatedTreeDocIds: [],
  abortController: null,
  overviewData: {
    totalDocuments: 0,
    readyDocuments: 0,
    totalChunks: 0,
    totalStorageBytes: 0,
    totalStorageFormatted: "0 KB",
    totalConversations: 0,
    totalMessages: 0,
    contextDepth: 0,
    encryptionStandard: "AES-256",
    engineVersion: "v4.2-RAG",
    topicDistribution: [],
  },

  setActiveSection: (activeSection) => set({ activeSection }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setDocuments: (documents) => set({ documents }),

  setSelectedDocument: (selectedDocument) => {
    if (get().abortController) {
      get().abortController.abort();
    }
    set({
      selectedDocument,
      messages: [],
      conversationId: null,
      activeConversationId: null,
      conversations: [],
      conversationsList: [],
      abortController: null,
      isProcessing: false,
    });
  },

  cancelGeneration: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
      set({ abortController: null, isProcessing: false });
      toast.success("Generation stopped.");
    }
  },

  setMessages: (messages) => set({ messages }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setOverviewData: (updater) =>
    set((state) => ({
      overviewData:
        typeof updater === "function" ? updater(state.overviewData) : updater,
    })),

  // 1. Fetch Documents
  fetchDocuments: async () => {
    try {
      const data = await ragApi.getDocuments();
      const docsArray = Array.isArray(data) ? data : data.documents || [];
      const mapped = docsArray.map((doc) => ({
        id: doc._id || doc.id,
        _id: doc._id || doc.id,
        name: doc.fileName || doc.name || "Untitled Document",
        title: doc.fileName || doc.title || "Untitled Document",
        pdfUrl: doc.pdfUrl,
        workspace_id: doc.workspace_id,
        size: doc.size || "N/A",
        pages: doc.pages || 0,
        uploadedAt: new Date(doc.uploadedAt || doc.createdAt || Date.now()),
        status: doc.status || "ready",
        errorMessage: doc.errorMessage || "",
      }));

      set({
        documents: mapped,
      });
      await get().fetchGeneratedTreeIds();
    } catch (error) {
      toast.error(error.message || "Failed to load document vault.");
    }
  },

  // 2. Upload Document
  handleFileUpload: async (e) => {
    const file = e.target?.files ? e.target.files[0] : null;
    if (!file) return;

    set({ isUploading: true });

    const tempId = Date.now().toString();
    const newDocPlaceholder = {
      id: tempId,
      _id: tempId,
      name: file.name,
      title: file.name,
      pdfUrl: "",
      workspace_id: "",
      size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
      pages: 0,
      uploadedAt: new Date(),
      status: "processing",
      errorMessage: "",
    };

    set((state) => ({
      documents: [newDocPlaceholder, ...state.documents],
    }));

    try {
      const payload = await ragApi.uploadDocument(file);
      const uploadedDoc = payload.document || payload;

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === tempId
            ? {
                ...doc,
                id: uploadedDoc._id || uploadedDoc.id,
                _id: uploadedDoc._id || uploadedDoc.id,
                pdfUrl: uploadedDoc.pdfUrl,
                workspace_id: uploadedDoc.workspace_id,
                status: uploadedDoc.status || "ready",
                errorMessage: uploadedDoc.errorMessage || "",
              }
            : doc,
        ),
      }));

      toast.success("Document indexed successfully!");
      await get().fetchOverviewData();
    } catch (error) {
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === tempId
            ? {
                ...doc,
                status: "failed",
                errorMessage:
                  error.message || "Failed to create embeddings for this PDF",
              }
            : doc,
        ),
      }));
      toast.error(error.message || "Upload failed");
    } finally {
      set({ isUploading: false });
    }
  },

  // 3. Delete Document
  handleDeleteDoc: async (id) => {
    try {
      await ragApi.deleteDocument(id);
      const { documents, selectedDocument } = get();
      set({
        documents: documents.filter((doc) => doc.id !== id && doc._id !== id),
        selectedDocument:
          selectedDocument?.id === id || selectedDocument?._id === id
            ? null
            : selectedDocument,
      });
      toast.success("Document removed from vault.");
      await get().fetchOverviewData();
    } catch (error) {
      toast.error(error.message || "Failed to remove document");
    }
  },

  // 4. Select Document with Verification
  selectDocument: async (doc) => {
    if (doc.status !== "ready") {
      toast.error(`Document is not ready: status is "${doc.status}"`);
      return false;
    }
    const docId = doc._id || doc.id;
    get().setSelectedDocument(doc);
    await get().loadUserChatThreads(docId);
    return true;
  },

  // 5. Send Chat Message
  sendMessage: async (text) => {
    if (!text.trim()) return;
    const selectedDocument = get().selectedDocument;
    if (!selectedDocument) {
      toast.error("Please select a document first.");
      return;
    }

    const docId = selectedDocument._id || selectedDocument.id;
    let currentConversationId =
      get().activeConversationId || get().conversationId;

    if (!currentConversationId) {
      const newSession = await get().createChatSession(docId);
      currentConversationId = newSession?._id || newSession?.id;
      if (!currentConversationId) {
        toast.error("Could not establish a chat session.");
        return;
      }
    }

    if (get().abortController) {
      get().abortController.abort();
    }

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const userMsg = {
      id: userMsgId,
      _id: userMsgId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const assistantPlaceholder = {
      id: assistantMsgId,
      _id: assistantMsgId,
      role: "assistant",
      content: "",
      citations: [],
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, assistantPlaceholder],
      isProcessing: true,
    }));

    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const data = await chatApi.sendMessage({
        message: text,
        conversationId: currentConversationId,
        documentId: docId,
        signal: controller.signal,
      });

      const answer =
        data.assistantMessage?.content ||
        data.answer ||
        "No response generated.";
      const citations = (
        data.assistantMessage?.citations ||
        data.citations ||
        []
      ).map((c) => ({
        documentId: c.documentId || docId,
        fileName: c.fileName || "Document.pdf",
        pageNumber: c.pageNumber || 1,
        textSnippet: c.textSnippet || c.snippet || "",
      }));

      const finalConvId =
        data.conversationId || data.sessionId || currentConversationId;

      set((state) => ({
        conversationId: finalConvId,
        activeConversationId: finalConvId,
        messages: state.messages.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                id: data.assistantMessage?._id || assistantMsgId,
                _id: data.assistantMessage?._id || assistantMsgId,
                content: answer,
                citations: citations,
              }
            : msg,
        ),
        conversationsList: state.conversationsList.map((c) =>
          c._id === finalConvId || c.id === finalConvId
            ? {
                ...c,
                lastMessage: text.slice(0, 50),
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        conversations: state.conversations.map((c) =>
          c._id === finalConvId || c.id === finalConvId
            ? {
                ...c,
                lastMessage: text.slice(0, 50),
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      }));

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
              : msg,
          ),
        }));
        toast.error(error.message || "Failed to send message");
      }
    } finally {
      set({ isProcessing: false, abortController: null });
    }
  },

  // 6. Create Chat Session
  createChatSession: async (documentId) => {
    const targetDocId =
      documentId || get().selectedDocument?.id || get().selectedDocument?._id;
    if (!targetDocId || targetDocId === "undefined") {
      toast.error("Please select a document first to start a chat session.");
      return null;
    }

    set({ isProcessing: true });
    try {
      const payload = await chatApi.createConversation(
        targetDocId,
        "New Conversation",
      );
      const newConv = payload.conversation ||
        payload.session || {
          _id: payload.conversationId,
          id: payload.conversationId,
          documentId: targetDocId,
          title: "New Conversation",
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

      const newConvId = newConv._id || newConv.id;

      set((state) => ({
        activeConversationId: newConvId,
        conversationId: newConvId,
        conversations: [
          newConv,
          ...state.conversations.filter(
            (c) => c._id !== newConvId && c.id !== newConvId,
          ),
        ],
        conversationsList: [
          newConv,
          ...state.conversationsList.filter(
            (c) => c._id !== newConvId && c.id !== newConvId,
          ),
        ],
        messages: [],
        isProcessing: false,
      }));

      toast.success("New chat initialized!");
      return newConv;
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to start new chat");
      return null;
    }
  },

  // Aliases for compatibility
  createNewChatSession: async (documentId) =>
    get().createChatSession(documentId),
  createSession: async (documentId) => get().createChatSession(documentId),

  // 7. Load Conversation List for Document
  loadUserChatThreads: async (documentId) => {
    try {
      const targetDocId =
        documentId || get().selectedDocument?.id || get().selectedDocument?._id;
      const data = await chatApi.getConversations(targetDocId);
      const rawList = Array.isArray(data)
        ? data
        : data.conversations || data.sessions || [];
      const list = rawList.map((c) => ({
        ...c,
        id: c._id || c.id,
        _id: c._id || c.id,
      }));

      set({
        conversationsList: list,
        conversations: list,
      });

      if (list.length > 0 && !get().activeConversationId) {
        const firstThreadId = list[0]._id || list[0].id;
        await get().selectChatSession(firstThreadId);
      } else if (list.length === 0) {
        set({
          activeConversationId: null,
          conversationId: null,
          messages: [],
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to load chat history");
    }
  },

  // 8. Select and Load Specific Conversation Messages
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
      const mapped = rawMessages.map((msg) => ({
        id: msg._id || msg.id,
        _id: msg._id || msg.id,
        role: msg.role,
        content: msg.content,
        citations: (msg.citations || []).map((c) => ({
          documentId: c.documentId,
          fileName: c.fileName || "Document.pdf",
          pageNumber: c.pageNumber || 1,
          textSnippet: c.textSnippet || c.snippet || "",
        })),
        isEdited: msg.isEdited || false,
        createdAt: msg.createdAt,
      }));

      mapped.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
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

  // 9. Delete Chat Session
  deleteChatSession: async (conversationId) => {
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

      const targetDocId =
        get().selectedDocument?.id || get().selectedDocument?._id;
      await get().loadUserChatThreads(targetDocId);

      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete chat session");
    }
  },

  // 10. Edit Message
  editMessagePrompt: async (messageId, newContent) => {
    try {
      set({ isProcessing: true });
      await chatApi.editMessage(messageId, newContent);

      const activeId = get().activeConversationId;
      if (activeId) {
        await get().selectChatSession(activeId);
      }
      const targetDocId =
        get().selectedDocument?.id || get().selectedDocument?._id;
      await get().loadUserChatThreads(targetDocId);

      set({ isProcessing: false });
      toast.success("Message updated!");
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to edit chat message");
    }
  },

  // 11. Knowledge Tree Helpers
  fetchGeneratedTreeIds: async () => {
    try {
      const data = await ragApi.getGeneratedTreeIds();
      set({ generatedTreeDocIds: Array.isArray(data) ? data : [] });
    } catch (error) {
      // Fail silently for background tree check
    }
  },

  generateOrFetchTree: async (documentId) => {
    try {
      const data = await ragApi.generateOrFetchTree(documentId);
      const treeData = data.treeData || data;
      set({
        activeTreeData: treeData,
        isTreeModalOpen: true,
      });
      const currentIds = get().generatedTreeDocIds || [];
      if (!currentIds.includes(documentId)) {
        set({ generatedTreeDocIds: [...currentIds, documentId] });
      }
    } catch (error) {
      toast.error(error.message || "Failed to build knowledge tree");
    }
  },

  closeTreeModal: () => {
    set({
      activeTreeData: null,
      isTreeModalOpen: false,
    });
  },

  // 12. Fetch Overview Statistics
  fetchOverviewData: async () => {
    try {
      const res = await overviewApi.getStats();
      if (res.success && res.data) {
        set({ overviewData: res.data });
      }
    } catch (error) {
      console.error("Failed to load overview data:", error.message);
    }
  },
}));
