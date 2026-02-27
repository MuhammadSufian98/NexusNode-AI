"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "react-hot-toast";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  // === [SECTION: NAVIGATION & UI] ===
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // === [SECTION: DOCUMENT VAULT] ===
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Architecture_V1.pdf",
      size: "2.4MB",
      pages: 12,
      uploadedAt: new Date(),
    },
    {
      id: 2,
      name: "Neural_Weights.pdf",
      size: "1.1MB",
      pages: 5,
      uploadedAt: new Date(),
    },
    {
      id: 3,
      name: "API_Spec.pdf",
      size: "850KB",
      pages: 24,
      uploadedAt: new Date(),
    },
    {
      id: 4,
      name: "Machine_Learning_Models.pdf",
      size: "3.2MB",
      pages: 40,
      uploadedAt: new Date(),
    },
    {
      id: 5,
      name: "Data_Analysis_Report.pdf",
      size: "1.8MB",
      pages: 15,
      uploadedAt: new Date(),
    },
    {
      id: 6,
      name: "Deep_Learning_Notes.pdf",
      size: "2.0MB",
      pages: 30,
      uploadedAt: new Date(),
    },
    {
      id: 7,
      name: "Cloud_Architecture_Guide.pdf",
      size: "2.7MB",
      pages: 22,
      uploadedAt: new Date(),
    },
    {
      id: 8,
      name: "Quantum_Computing_Overview.pdf",
      size: "3.4MB",
      pages: 18,
      uploadedAt: new Date(),
    },
    {
      id: 9,
      name: "Artificial_Intelligence_Research.pdf",
      size: "4.0MB",
      pages: 50,
      uploadedAt: new Date(),
    },
    {
      id: 10,
      name: "Blockchain_Technology.pdf",
      size: "5.1MB",
      pages: 35,
      uploadedAt: new Date(),
    },
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // === [SECTION: CHAT SYSTEM] ===
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // === [SECTION: OVERVIEW METRICS] ===
  const [overviewData, setOverviewData] = useState({
    docsIndexed: "3",
    engineVersion: "v4.2-stable",
    contextDepth: 88,
    spaceUsed: "4.2GB",
    chunks: "12,402",
    velocityData: [40, 70, 45, 90, 65, 80, 30, 95, 50, 75],
  });

  // === [LOGIC: ACTIONS] ===
  const handleFileUpload = (e) => {
    const file = e.target?.files ? e.target.files[0] : null;

    // UI Feedback for Uploading
    setIsUploading(true);

    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        name: file ? file.name : "new-analysis.pdf",
        size: file ? (file.size / 1024 / 1024).toFixed(1) + "MB" : "1.2MB",
        pages: Math.floor(Math.random() * 20) + 1,
        uploadedAt: new Date(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setOverviewData((prev) => ({
        ...prev,
        docsIndexed: (documents.length + 1).toString(),
      }));

      setIsUploading(false);
      toast.success("Document indexed!");
    }, 2000);
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (selectedDocument?.id === id) setSelectedDocument(null);
    toast.error("Document removed");
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've analyzed the content in ${selectedDocument?.name || "the vault"}. Based on the neural map, the core concept involves specialized vector embeddings.`,
          sources: [{ page: Math.floor(Math.random() * 5) + 1 }],
        },
      ]);
      setIsProcessing(false);
      toast.success("Insight retrieved!");
    }, 1200);
  };

  const value = {
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    isUploading,
    setIsUploading,
    documents,
    setDocuments,
    handleFileUpload,
    deleteDocument,
    selectedDocument,
    setSelectedDocument,
    messages,
    setMessages,
    sendMessage,
    isProcessing,
    overviewData,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);
