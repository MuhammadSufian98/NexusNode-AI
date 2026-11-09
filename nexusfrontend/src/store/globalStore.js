"use client";

import { useUiStore } from "./useUiStore";
import { useDocumentStore } from "./useDocumentStore";
import { useChatStore } from "./useChatStore";
import { useOverviewStore } from "./useOverviewStore";
import { useSettingsStore } from "./useSettingsStore";

/**
 * @deprecated Deprecated composite store hook.
 * Directly import specific domain slice stores: useUiStore, useDocumentStore, useChatStore, useOverviewStore, useSettingsStore.
 */
export const useGlobal = (selector) => {
  const ui = useUiStore.getState();
  const doc = useDocumentStore.getState();
  const chat = useChatStore.getState();
  const overview = useOverviewStore.getState();
  const settings = useSettingsStore.getState();

  const compositeState = {
    // UI State
    activeSection: ui.activeSection,
    setActiveSection: ui.setActiveSection,
    sidebarOpen: ui.sidebarOpen,
    setSidebarOpen: ui.setSidebarOpen,
    toggleSidebar: ui.toggleSidebar,
    modals: ui.modals,
    openModal: ui.openModal,
    closeModal: ui.closeModal,

    // Document State & Actions
    documents: doc.documents,
    selectedDocument: doc.selectedDocument,
    isUploading: doc.isUploading,
    uploadProgress: doc.uploadProgress,
    setDocuments: doc.setDocuments,
    setIsUploading: doc.setIsUploading,
    setSelectedDocument: doc.setSelectedDocument,
    fetchDocuments: doc.fetchDocuments,
    handleFileUpload: doc.handleFileUpload,
    handleDeleteDoc: doc.handleDeleteDoc,
    selectDocument: doc.selectDocument,

    // Chat State & Actions
    messages: chat.messages,
    conversationsList: chat.conversationsList,
    conversations: chat.conversations,
    activeConversationId: chat.activeConversationId,
    conversationId: chat.conversationId,
    isProcessing: chat.isProcessing,
    abortController: chat.abortController,
    setMessages: chat.setMessages,
    setIsProcessing: chat.setIsProcessing,
    cancelGeneration: chat.cancelGeneration,
    sendMessage: chat.sendMessage,
    createChatSession: chat.createChatSession,
    createNewChatSession: chat.createNewChatSession,
    createSession: chat.createSession,
    loadUserChatThreads: chat.loadUserChatThreads,
    selectChatSession: chat.selectChatSession,
    loadSessionMessages: chat.loadSessionMessages,
    loadConversationMessages: chat.loadConversationMessages,
    deleteChatSession: chat.deleteChatSession,
    editMessagePrompt: chat.editMessagePrompt,

    // Overview State & Actions
    overviewData: overview.overviewData,
    fetchOverviewData: overview.fetchOverviewData,
    setOverviewData: overview.setOverviewData,

    // Settings State & Actions
    settingsConfig: settings.config,
    loadSettings: settings.loadSettings,
    saveNeuralKey: settings.saveNeuralKey,
    purgeVault: settings.purgeVault,
    clearChatLogs: settings.clearChatLogs,
    reindexAssets: settings.reindexAssets,
  };

  if (typeof selector === "function") {
    return selector(compositeState);
  }

  return compositeState;
};

export default useGlobal;
