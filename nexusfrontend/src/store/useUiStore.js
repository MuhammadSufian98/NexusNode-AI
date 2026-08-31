"use client";

import { create } from "zustand";

/**
 * Navigation and UI Store for application-wide UI state
 */
export const useUiStore = create((set, get) => ({
  // Navigation
  activeSection: "dashboard", // "dashboard" | "overview" | "documents" | "chat" | "profile" | "settings"
  sidebarOpen: false,

  // Global Modals State
  modals: {
    knowledgeTree: false,
    pdfViewer: false,
    errorDetails: false,
    confirmAction: false,
  },
  modalData: {},

  // Navigation Actions
  setActiveSection: (activeSection) => set({ activeSection }),
  setSidebarOpen: (sidebarOpen) =>
    set((state) => ({
      sidebarOpen:
        typeof sidebarOpen === "function"
          ? sidebarOpen(state.sidebarOpen)
          : sidebarOpen,
    })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Modal Actions
  openModal: (modalName, data = null) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
      modalData: data !== null ? { ...state.modalData, [modalName]: data } : state.modalData,
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
      modalData: { ...state.modalData, [modalName]: null },
    })),

  closeAllModals: () =>
    set({
      modals: {
        knowledgeTree: false,
        pdfViewer: false,
        errorDetails: false,
        confirmAction: false,
      },
      modalData: {},
    }),
}));

export default useUiStore;
