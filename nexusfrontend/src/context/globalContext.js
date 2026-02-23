"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  // 1. Navigation State
  const [activeSection, setActiveSection] = useState("overview");

  // 2. Document State
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "System_Architecture.pdf",
      size: "2.4MB",
      pages: 12,
      uploadedAt: new Date(),
    },
    {
      id: 2,
      name: "Neural_Weights_v2.pdf",
      size: "1.1MB",
      pages: 5,
      uploadedAt: new Date(),
    },
    {
      id: 3,
      name: "API_Documentation.pdf",
      size: "850KB",
      pages: 24,
      uploadedAt: new Date(),
    },
    {
      id: 12,
      name: "System_Architecture.pdf",
      size: "2.4MB",
      pages: 12,
      uploadedAt: new Date(),
    },
    {
      id: 23,
      name: "Neural_Weights_v2.pdf",
      size: "1.1MB",
      pages: 5,
      uploadedAt: new Date(),
    },
    {
      id: 34,
      name: "API_Documentation.pdf",
      size: "850KB",
      pages: 24,
      uploadedAt: new Date(),
    },
  ]);

  // 3. Overview Metrics State
  const [overviewData, setOverviewData] = useState({
    docsIndexed: "3",
    engineVersion: "v4.2-stable",
    contextDepth: 88,
    spaceUsed: "4.2GB",
    chunks: "12,402",
    velocityData: [40, 70, 45, 90, 65, 80, 30, 95, 50, 75], // For the sparklines
  });

  // 4. Handle File Upload (Simulation)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate a loading/ingestion process
    const newDoc = {
      id: Date.now(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + "MB",
      pages: Math.floor(Math.random() * 20) + 1,
      uploadedAt: new Date(),
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Update overview stats to show immediate feedback
    setOverviewData((prev) => ({
      ...prev,
      docsIndexed: (parseInt(prev.docsIndexed) + 1).toString(),
      chunks: (parseInt(prev.chunks.replace(",", "")) + 450).toLocaleString(),
    }));
  };

  // 5. Dynamic data updates (Simulation of "Neural Activity")
  useEffect(() => {
    const interval = setInterval(() => {
      setOverviewData((prev) => ({
        ...prev,
        contextDepth: Math.min(
          100,
          Math.max(80, prev.contextDepth + (Math.random() > 0.5 ? 1 : -1)),
        ),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    activeSection,
    setActiveSection,
    documents,
    setDocuments,
    overviewData,
    handleFileUpload,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
