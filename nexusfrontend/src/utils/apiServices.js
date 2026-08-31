import api from "@/lib/api";

export const ragApi = {
  // Document Operations
  getDocuments: async () => {
    const res = await api.get("/api/rag/documents");
    return res.data;
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);
    const res = await api.post("/api/rag/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  deleteDocument: async (documentId) => {
    const res = await api.delete(`/api/rag/documents/${documentId}`);
    return res.data;
  },

  // Knowledge Tree Operations
  getGeneratedTreeIds: async () => {
    const res = await api.get("/api/rag/tree/ids");
    return res.data;
  },

  generateOrFetchTree: async (documentId) => {
    const res = await api.post(`/api/rag/tree/${documentId}`);
    return res.data;
  },

  generateMasterTree: async () => {
    const res = await api.post("/api/rag/tree/global");
    return res.data;
  },
};

export const chatApi = {
  sendMessage: async ({ message, conversationId, documentId, signal }) => {
    const res = await api.post(
      "/api/chat/message",
      {
        message,
        prompt: message,
        conversationId,
        sessionId: conversationId,
        documentId,
        workspace_id: documentId,
      },
      { signal },
    );
    return res.data;
  },

  createConversation: async (documentId, title = "New Conversation") => {
    const res = await api.post("/api/chat/conversations", {
      documentId,
      workspace_id: documentId,
      title,
    });
    return res.data;
  },

  getConversations: async (documentId) => {
    const url = documentId
      ? `/api/chat/conversations?documentId=${documentId}`
      : "/api/chat/conversations";
    const res = await api.get(url);
    return res.data;
  },

  getMessages: async (conversationId) => {
    const res = await api.get(
      `/api/chat/conversations/${conversationId}/messages`,
    );
    return res.data;
  },

  deleteConversation: async (conversationId) => {
    const res = await api.delete(`/api/chat/conversations/${conversationId}`);
    return res.data;
  },

  editMessage: async (messageId, content) => {
    const res = await api.put(`/api/chat/message/${messageId}`, { content });
    return res.data;
  },
};

export const overviewApi = {
  getStats: async () => {
    const res = await api.get("/api/overview");
    return res.data;
  },
};
