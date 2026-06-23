"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";
import API_BASE_URL from "@/lib/apiBaseUrl";

const createInitialDocuments = () => [];

export const useGlobal = create((set, get) => ({
  activeSection: "dashboard",
  sidebarOpen: false,
  isUploading: false,
  documents: createInitialDocuments(),
  selectedDocument: null,
  messages: [],
  conversationId: null,
  activeConversationId: null,
  conversationsList: [],
  isProcessing: false,
  activeTreeData: null,
  isTreeModalOpen: false,
  generatedTreeDocIds: [],
  overviewData: {
    docsIndexed: "0",
    engineVersion: "v4.2-stable",
    contextDepth: 0,
    spaceUsed: "0GB",
    maskedPII: "0",
    chunks: "0",
    velocityData: [],
  },
  setActiveSection: (activeSection) => set({ activeSection }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setDocuments: (documents) => set({ documents }),
  setSelectedDocument: (selectedDocument) => set({ selectedDocument, messages: [], conversationId: null, activeConversationId: null }),
  setMessages: (messages) => set({ messages }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setOverviewData: (updater) =>
    set((state) => ({
      overviewData:
        typeof updater === "function" ? updater(state.overviewData) : updater,
    })),
  fetchDocuments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/documents`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      const mapped = data.map((doc) => ({
        id: doc._id,
        name: doc.fileName,
        pdfUrl: doc.pdfUrl,
        workspace_id: doc.workspace_id,
        size: "N/A",
        pages: 0,
        uploadedAt: new Date(doc.uploadedAt),
        status: "ready",
      }));
      set({
        documents: mapped,
        overviewData: {
          ...get().overviewData,
          docsIndexed: mapped.length.toString(),
        },
      });
      await get().fetchGeneratedTreeIds();
    } catch (error) {
      toast.error(error.message || "Failed to load vault");
    }
  },
  handleFileUpload: async (e) => {
    const file = e.target?.files ? e.target.files[0] : null;
    if (!file) return;

    set({ isUploading: true });

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(`${API_BASE_URL}/api/rag/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const payload = await response.json();
      const currentDocuments = get().documents;
      const newDoc = {
        id: payload.document._id,
        name: payload.document.fileName,
        pdfUrl: payload.document.pdfUrl,
        workspace_id: payload.document.workspace_id,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        pages: 0,
        uploadedAt: new Date(payload.document.uploadedAt),
        status: "ready",
      };

      set({
        documents: [newDoc, ...currentDocuments],
        overviewData: {
          ...get().overviewData,
          docsIndexed: (currentDocuments.length + 1).toString(),
        },
      });

      toast.success("Document indexed!");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      set({ isUploading: false });
    }
  },
  handleDeleteDoc: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      const { documents, selectedDocument } = get();
      set({
        documents: documents.filter((doc) => doc.id !== id),
        selectedDocument: selectedDocument?.id === id ? null : selectedDocument,
        overviewData: {
          ...get().overviewData,
          docsIndexed: (documents.length - 1).toString(),
        },
      });
      toast.success("Document removed");
    } catch (error) {
      toast.error(error.message || "Failed to remove document");
    }
  },
  sendMessage: async (text) => {
    if (!text.trim()) return;
    const selectedDocument = get().selectedDocument;
    if (!selectedDocument) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isProcessing: true,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          conversationId: get().activeConversationId || undefined,
          documentId: selectedDocument.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve response");
      }

      const payload = await response.json();
      set({
        conversationId: payload?.conversationId || null,
        activeConversationId: payload?.conversationId || null,
      });
      await get().loadConversationMessages(payload.conversationId);
      await get().loadUserChatThreads(selectedDocument.id);
      set({ isProcessing: false });
      toast.success("Insight retrieved!");
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Message failed");
    }
  },
  createNewChatSession: async (workspaceId) => {
    set({
      activeConversationId: null,
      conversationId: null,
      messages: [],
      isProcessing: true,
    });
    try {
      const selectedDocument = get().selectedDocument;
      const docIds = selectedDocument ? [selectedDocument.id] : [];

      const response = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspace_id: workspaceId || undefined,
          documentIds: docIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat session");
      }

      const payload = await response.json();
      set({
        activeConversationId: payload.conversationId,
        conversationId: payload.conversationId,
        messages: [],
        isProcessing: false,
      });

      await get().loadUserChatThreads(workspaceId);
      toast.success("New chat initialized!");
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to start new chat");
    }
  },
  loadUserChatThreads: async (workspaceId) => {
    try {
      const activeWorkspaceId = workspaceId || get().selectedDocument?.id;
      let url = `${API_BASE_URL}/api/chat/conversations`;
      if (activeWorkspaceId) {
        url += `?workspace_id=${activeWorkspaceId}`;
      }
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch threads");
      }

      const data = await response.json();
      set({ conversationsList: data });

      if (data.length > 0 && !get().activeConversationId) {
        const firstThreadId = data[0]._id || data[0].id;
        get().selectChatSession(firstThreadId);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load chat history");
    }
  },
  loadConversationMessages: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      const mapped = data.map((msg) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        citations: msg.citations?.map((c) => ({
          documentId: c.documentId,
          fileName: c.fileName || "Unknown File",
          textSnippet: c.textSnippet || "",
        })) || [],
        isEdited: msg.isEdited || false,
        createdAt: msg.createdAt,
      }));

      mapped.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

      set({
        activeConversationId: conversationId,
        conversationId: conversationId,
        messages: mapped,
      });
    } catch (error) {
      toast.error(error.message || "Failed to load thread message history");
    }
  },
  selectChatSession: async (conversationId) => {
    set({
      activeConversationId: conversationId,
      conversationId: conversationId,
      messages: [],
      isProcessing: true,
    });
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      const mapped = data.map((msg) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        citations: msg.citations?.map((c) => ({
          documentId: c.documentId,
          fileName: c.fileName || "Unknown File",
          textSnippet: c.textSnippet || "",
        })) || [],
        isEdited: msg.isEdited || false,
        createdAt: msg.createdAt,
      }));

      mapped.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

      set({
        messages: mapped,
        isProcessing: false,
      });
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to load thread message history");
    }
  },
  deleteChatSession: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversation/${conversationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat session");
      }

      const activeId = get().activeConversationId;
      if (activeId === conversationId) {
        set({
          activeConversationId: null,
          conversationId: null,
          messages: [],
        });
      }

      const selectedDocument = get().selectedDocument;
      await get().loadUserChatThreads(selectedDocument ? selectedDocument.id : undefined);

      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete chat session");
    }
  },
  editMessagePrompt: async (messageId, newContent) => {
    try {
      set({ isProcessing: true });
      const response = await fetch(`${API_BASE_URL}/api/chat/message/${messageId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit chat message");
      }

      await get().loadConversationMessages(get().activeConversationId);
      const selectedDocument = get().selectedDocument;
      await get().loadUserChatThreads(selectedDocument ? selectedDocument.id : undefined);
      set({ isProcessing: false });
      toast.success("Message updated and context regenerated!");
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Failed to edit chat message");
    }
  },
  fetchGeneratedTreeIds: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/tree/ids`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        set({ generatedTreeDocIds: data });
      }
    } catch (error) {
    }
  },
  generateOrFetchTree: async (documentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/tree/${documentId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to generate or fetch knowledge tree");
      }
      const data = await response.json();
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
      toast.error(error.message || "Failed to build tree");
    }
  },
  closeTreeModal: () => {
    set({
      activeTreeData: null,
      isTreeModalOpen: false,
    });
  },
}));