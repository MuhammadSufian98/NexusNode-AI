import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "@/lib/httpClient";

/**
 * Send a chat message or prompt to RAG endpoint
 * @param {object} params
 * @param {string} params.message - Prompt text
 * @param {string} [params.conversationId] - Active conversation ID
 * @param {string} [params.documentId] - Active document ID
 * @param {AbortSignal} [params.signal] - Request abort signal
 * @param {object} [config={}] - Additional configuration
 * @returns {Promise<any>}
 */
export async function sendMessage(
  { message, conversationId, documentId, signal },
  config = {}
) {
  const payload = {
    message,
    prompt: message,
    conversationId,
    sessionId: conversationId,
    documentId,
    workspace_id: documentId,
  };

  return postRequest("/api/chat/message", payload, {
    signal,
    ...config,
  });
}

/**
 * Create a new conversation thread
 * @param {string} documentId - Associated document ID
 * @param {string} [title="New Conversation"] - Conversation title
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function createConversation(
  documentId,
  title = "New Conversation",
  config = {}
) {
  const payload = {
    documentId,
    workspace_id: documentId,
    title,
  };

  return postRequest("/api/chat/conversations", payload, config);
}

/**
 * Fetch all conversations, optionally filtered by documentId
 * @param {string} [documentId] - Document ID filter
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function getConversations(documentId, config = {}) {
  const params = documentId ? { documentId } : {};
  return getRequest("/api/chat/conversations", params, config);
}

/**
 * Fetch all messages for a specific conversation
 * @param {string} conversationId - Conversation thread ID
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function getMessages(conversationId, config = {}) {
  return getRequest(
    `/api/chat/conversations/${conversationId}/messages`,
    {},
    config
  );
}

/**
 * Delete a conversation thread by ID
 * @param {string} conversationId - Conversation ID
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function deleteConversation(conversationId, config = {}) {
  return deleteRequest(`/api/chat/conversations/${conversationId}`, config);
}

/**
 * Edit a specific message's prompt/content
 * @param {string} id - Message ID
 * @param {string} content - Updated message content
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function editMessage(id, content, config = {}) {
  return putRequest(`/api/chat/message/${id}`, { content }, config);
}

export const chatApi = {
  sendMessage,
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
  editMessage,
};

export default chatApi;
