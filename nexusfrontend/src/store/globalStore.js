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
  isProcessing: false,
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
  setSelectedDocument: (selectedDocument) => set({ selectedDocument }),
  setMessages: (messages) => set({ messages }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setOverviewData: (updater) =>
    set((state) => ({
      overviewData:
        typeof updater === "function" ? updater(state.overviewData) : updater,
    })),
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

      const currentDocuments = get().documents;
      const newDoc = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        pages: 0,
        uploadedAt: new Date(),
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
  handleDeleteDoc: (id) => {
    const { documents, selectedDocument } = get();
    set({
      documents: documents.filter((doc) => doc.id !== id),
      selectedDocument: selectedDocument?.id === id ? null : selectedDocument,
    });
    toast.error("Document removed");
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
      const response = await fetch(`${API_BASE_URL}/api/rag/search`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text, generateResponse: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve response");
      }

      const payload = await response.json();
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              payload?.answer || "I could not generate a response at this time.",
            sources: [{ page: 1 }],
          },
        ],
        isProcessing: false,
      }));
      toast.success("Insight retrieved!");
    } catch (error) {
      set({ isProcessing: false });
      toast.error(error.message || "Message failed");
    }
  },
}));