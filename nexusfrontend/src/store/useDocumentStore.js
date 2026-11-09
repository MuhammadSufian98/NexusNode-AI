"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";
import { documentsApi } from "@/services/documentsApi";
import { formatDocument, createInitialDocument } from "@/types/schemas";

/**
 * Domain store for Document Vault operations
 */
export const useDocumentStore = create((set, get) => ({
  documents: [],
  selectedDocument: null,
  isUploading: false,
  uploadProgress: 0,
  isLoading: false,

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

      return mapped;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.userFriendlyMessage || error.message || "Failed to load document vault.");
      return [];
    }
  },

  // 2. Upload Document File (accepts change event or File directly)
  handleFileUpload: async (eOrFile) => {
    const file = eOrFile?.target?.files ? eOrFile.target.files[0] : eOrFile;
    if (!file) return null;

    // Validate PDF type and size (< 50MB)
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Invalid file format. Only PDF documents are supported.");
      return null;
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      toast.error("File exceeds maximum allowed size (50MB).");
      return null;
    }

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
      const payload = await documentsApi.uploadDocument(file, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            set({ uploadProgress: percent });
          }
        },
      });

      const uploadedDoc = payload.document || payload;
      const formattedDoc = formatDocument(uploadedDoc);

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === tempId ? { ...doc, ...formattedDoc } : doc
        ),
        uploadProgress: 100,
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
                  error.userFriendlyMessage ||
                  error.message ||
                  "Failed to create embeddings for this PDF",
              }
            : doc
        ),
      }));
      toast.error(error.userFriendlyMessage || error.message || "Upload failed");
      return null;
    } finally {
      setTimeout(() => {
        set({ isUploading: false, uploadProgress: 0 });
      }, 500);
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
      toast.error(error.userFriendlyMessage || error.message || "Failed to remove document");
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

  // 5. Expand Vector Tier for large documents
  expandVectorTier: async (id) => {
    try {
      const res = await documentsApi.expandVectorTier(id);
      const updatedDoc = res.document || res;
      const formattedDoc = formatDocument(updatedDoc);

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id || doc._id === id ? { ...doc, ...formattedDoc } : doc
        ),
      }));

      toast.success(res.message || "Vector tier expanded!");
      return formattedDoc;
    } catch (error) {
      toast.error(error.userFriendlyMessage || error.message || "Failed to expand vector tier");
      return null;
    }
  },
}));

export default useDocumentStore;
