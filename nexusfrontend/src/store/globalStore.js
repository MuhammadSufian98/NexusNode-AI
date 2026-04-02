"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";

const createInitialDocuments = () => [
  {
    id: 1,
    name: "Architecture_V1.pdf",
    size: "2.4MB",
    pages: 12,
    uploadedAt: new Date(),
    status: "redacting",
  },
  {
    id: 2,
    name: "Neural_Weights.pdf",
    size: "1.1MB",
    pages: 5,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 3,
    name: "API_Spec.pdf",
    size: "850KB",
    pages: 24,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 4,
    name: "Machine_Learning_Models.pdf",
    size: "3.2MB",
    pages: 40,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 5,
    name: "Data_Analysis_Report.pdf",
    size: "1.8MB",
    pages: 15,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 6,
    name: "Deep_Learning_Notes.pdf",
    size: "2.0MB",
    pages: 30,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 7,
    name: "Cloud_Architecture_Guide.pdf",
    size: "2.7MB",
    pages: 22,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 8,
    name: "Quantum_Computing_Overview.pdf",
    size: "3.4MB",
    pages: 18,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 9,
    name: "Artificial_Intelligence_Research.pdf",
    size: "4.0MB",
    pages: 50,
    uploadedAt: new Date(),
    status: "ready",
  },
  {
    id: 10,
    name: "Blockchain_Technology.pdf",
    size: "5.1MB",
    pages: 35,
    uploadedAt: new Date(),
    status: "ready",
  },
];

export const useGlobal = create((set, get) => ({
  activeSection: "dashboard",
  sidebarOpen: false,
  isUploading: false,
  documents: createInitialDocuments(),
  selectedDocument: null,
  messages: [],
  isProcessing: false,
  overviewData: {
    docsIndexed: "3",
    engineVersion: "v4.2-stable",
    contextDepth: 88,
    spaceUsed: "4.2GB",
    maskedPII: "842",
    chunks: "12,402",
    velocityData: [40, 70, 45, 90, 65, 80, 30, 95, 50, 75],
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
  handleFileUpload: (e) => {
    const file = e.target?.files ? e.target.files[0] : null;

    set({ isUploading: true });

    setTimeout(() => {
      const currentDocuments = get().documents;
      const newDoc = {
        id: Date.now(),
        name: file ? file.name : "new-analysis.pdf",
        size: file ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : "1.2MB",
        pages: Math.floor(Math.random() * 20) + 1,
        uploadedAt: new Date(),
        status: "redacting",
      };

      set({
        documents: [newDoc, ...currentDocuments],
        overviewData: {
          ...get().overviewData,
          docsIndexed: (currentDocuments.length + 1).toString(),
        },
        isUploading: false,
      });

      setTimeout(() => {
        const refreshedDocuments = get().documents.map((doc) =>
          doc.id === newDoc.id ? { ...doc, status: "ready" } : doc,
        );

        set({ documents: refreshedDocuments });
      }, 1200);

      toast.success("Document indexed!");
    }, 2000);
  },
  handleDeleteDoc: (id) => {
    const { documents, selectedDocument } = get();
    set({
      documents: documents.filter((doc) => doc.id !== id),
      selectedDocument: selectedDocument?.id === id ? null : selectedDocument,
    });
    toast.error("Document removed");
  },
  sendMessage: (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isProcessing: true,
    }));

    setTimeout(() => {
      const selectedDocument = get().selectedDocument;
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I've analyzed the content in ${selectedDocument?.name || "the vault"}. Based on the neural map, the core concept involves specialized vector embeddings.`,
            sources: [{ page: Math.floor(Math.random() * 5) + 1 }],
          },
        ],
        isProcessing: false,
      }));
      toast.success("Insight retrieved!");
    }, 1200);
  },
}));