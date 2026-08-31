"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";
import { documentsApi } from "@/services/documentsApi";
import { formatDocument, createInitialDocument } from "@/types/schemas";

/**
 * Domain store for Document Vault and Knowledge Tree operations
 */
export const useDocumentStore = create((set, get) => ({
  documents: [],
  selectedDocument: null,
  isUploading: false,
  uploadProgress: 0,
  isLoading: false,
  activeTreeData: null,
  isTreeModalOpen: false,
  generatedTreeDocIds: [],

  // Direct Setters
  setDocuments: (documents) => set({ documents }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setSelectedDocument: (selectedDocument) => set({ selectedDocument }),

  // 1. Fetch Documents from Vault
  fetchDocuments: async () => {
    try {
      set({ isLoading: true });
      const data = await documentsApi.fetchDocuments();
      const docsArray = Array.isArray(data) ? data : data.documents || [];
      const mapped = docsArray.map((doc) => formatDocument(doc));

      set({
        documents: mapped,
        isLoading: false,
      });

      await get().fetchGeneratedTreeIds();
      return mapped;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to load document vault.");
      return [];
    }
  },

  // 2. Upload Document File (accepts change event or File directly)
  handleFileUpload: async (eOrFile) => {
    const file = eOrFile?.target?.files ? eOrFile.target.files[0] : eOrFile;
    if (!file) return null;

    set({ isUploading: true, uploadProgress: 0 });

    const tempId = `temp_${Date.now()}`;
    const newDocPlaceholder = createInitialDocument({
      id: tempId,
      name: file.name,
      title: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
      pages: 0,
      status: "processing",
      errorMessage: "",
    });

    set((state) => ({
      documents: [newDocPlaceholder, ...state.documents],
    }));

    try {
      const payload = await documentsApi.uploadDocument(file);
      const uploadedDoc = payload.document || payload;
      const formattedDoc = formatDocument(uploadedDoc);

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === tempId ? { ...doc, ...formattedDoc } : doc
        ),
      }));

      toast.success("Document indexed successfully!");
      return formattedDoc;
    } catch (error) {
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === tempId
            ? {
                ...doc,
                status: "error",
                errorMessage:
                  error.message || "Failed to create embeddings for this PDF",
              }
            : doc
        ),
      }));
      toast.error(error.message || "Upload failed");
      return null;
    } finally {
      set({ isUploading: false });
    }
  },

  // 3. Delete Document
  handleDeleteDoc: async (id) => {
    try {
      await documentsApi.deleteDocument(id);
      const { documents, selectedDocument } = get();

      set({
        documents: documents.filter((doc) => doc.id !== id && doc._id !== id),
        selectedDocument:
          selectedDocument?.id === id || selectedDocument?._id === id
            ? null
            : selectedDocument,
      });

      toast.success("Document removed from vault.");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to remove document");
      return false;
    }
  },

  // 4. Select Document with Verification
  selectDocument: async (doc) => {
    if (!doc) {
      set({ selectedDocument: null });
      return false;
    }

    if (doc.status !== "ready") {
      toast.error(`Document is not ready: status is "${doc.status}"`);
      return false;
    }

    set({ selectedDocument: doc });
    return true;
  },

  // 5. Knowledge Tree Operations
  fetchGeneratedTreeIds: async () => {
    try {
      const data = await documentsApi.getGeneratedTreeIds();
      set({ generatedTreeDocIds: Array.isArray(data) ? data : [] });
    } catch (error) {
      // Fail silently for background check
    }
  },

  generateOrFetchTree: async (documentId) => {
    try {
      const data = await documentsApi.generateTree(documentId);
      const treeData = data.treeData || data;

      set({
        activeTreeData: treeData,
        isTreeModalOpen: true,
      });

      const currentIds = get().generatedTreeDocIds || [];
      if (!currentIds.includes(documentId)) {
        set({ generatedTreeDocIds: [...currentIds, documentId] });
      }
      return treeData;
    } catch (error) {
      toast.error(error.message || "Failed to build knowledge tree");
      return null;
    }
  },

  closeTreeModal: () => {
    set({
      activeTreeData: null,
      isTreeModalOpen: false,
    });
  },

  openTreeModal: (treeData) => {
    set({
      activeTreeData: treeData,
      isTreeModalOpen: true,
    });
  },
}));

export default useDocumentStore;
