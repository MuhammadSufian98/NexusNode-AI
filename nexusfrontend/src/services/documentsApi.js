import {
  getRequest,
  postRequest,
  deleteRequest,
  uploadRequest,
} from "@/lib/httpClient";
import API_BASE_URL from "@/lib/apiBaseUrl";

/**
 * Fetch all documents in the vault
 * @returns {Promise<any>}
 */
export async function fetchDocuments() {
  return getRequest("/api/rag/documents");
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
 * Get IDs of documents that have generated knowledge trees
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function getGeneratedTreeIds(config = {}) {
  return getRequest("/api/rag/tree/ids", {}, config);
}

/**
 * Generate or fetch knowledge tree for a specific document
 * @param {string} docId - Document ID
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function generateTree(docId, config = {}) {
  return postRequest(`/api/rag/tree/${docId}`, {}, config);
}

/**
 * Generate global/master knowledge tree
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function generateMasterTree(config = {}) {
  return postRequest("/api/rag/tree/global", {}, config);
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
  return `${API_BASE_URL}/api/rag/documents/${id}/view-pdf`;
}

// Aliases for compatibility
export const getDocuments = fetchDocuments;
export const generateOrFetchTree = generateTree;

export const documentsApi = {
  fetchDocuments,
  getDocuments,
  uploadDocument,
  deleteDocument,
  expandVectorTier,
  getGeneratedTreeIds,
  generateTree,
  generateOrFetchTree,
  generateMasterTree,
  getDocumentPdfStreamUrl,
};

export const ragApi = documentsApi;
export default documentsApi;
