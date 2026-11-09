import {
  getRequest,
  postRequest,
  deleteRequest,
  uploadRequest,
} from "@/lib/httpClient";
import API_BASE_URL from "@/lib/apiBaseUrl";

/**
 * Fetch all documents in the vault
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function fetchDocuments(config = {}) {
  return getRequest("/api/rag/documents", {}, config);
}

/**
 * Upload a PDF document
 * @param {File|Blob|FormData} fileOrFormData - PDF File or FormData
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function uploadDocument(fileOrFormData, config = {}) {
  let formData;
  if (typeof FormData !== "undefined" && fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else {
    formData = new FormData();
    formData.append("pdf", fileOrFormData);
  }
  return uploadRequest("/api/rag/upload", formData, config);
}

/**
 * Delete a document by ID
 * @param {string} id - Document ID
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function deleteDocument(id, config = {}) {
  return deleteRequest(`/api/rag/documents/${id}`, config);
}

/**
 * Expand vector index tier for a document
 * @param {string} id - Document ID
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function expandVectorTier(id, config = {}) {
  return postRequest(`/api/rag/documents/${id}/expand-vector-tier`, {}, config);
}

/**
 * Get authenticated PDF streaming proxy URL for a document
 * @param {string} id - Document ID
 * @returns {string}
 */
export function getDocumentPdfStreamUrl(id) {
  return `${API_BASE_URL}/api/rag/documents/${id}/preview-stream`;
}

// Aliases for compatibility
export const getDocuments = fetchDocuments;

export const documentsApi = {
  fetchDocuments,
  getDocuments,
  uploadDocument,
  deleteDocument,
  expandVectorTier,
  getDocumentPdfStreamUrl,
};

export const ragApi = documentsApi;
export default documentsApi;
