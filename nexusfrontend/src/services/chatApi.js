import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "@/lib/httpClient";
import API_BASE_URL from "@/lib/apiBaseUrl";

/**
 * Stream a chat prompt using Fetch ReadableStream (SSE reader)
 * @param {object} params
 * @param {string} params.message - Prompt text
 * @param {string} [params.conversationId] - Active conversation ID
 * @param {string} [params.documentId] - Active document ID
 * @param {AbortSignal} [params.signal] - Abort controller signal
 * @param {function} [params.onToken] - Callback for each streaming token: (token, fullText)
 * @param {function} [params.onCitation] - Callback for extracted citations: (citations)
 * @param {function} [params.onError] - Error callback
 * @param {function} [params.onComplete] - Completion callback: (fullText, metadata)
 * @returns {Promise<string>} Accumulated response text
 */
export async function streamChatMessage({
  message,
  conversationId,
  documentId,
  signal,
  onToken,
  onCitation,
  onError,
  onComplete,
}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken")
      : null;

  const baseUrl = (API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
  const payload = {
    message,
    prompt: message,
    conversationId,
    sessionId: conversationId,
    documentId,
    workspace_id: documentId,
  };

  try {
    // Attempt real-time SSE stream endpoint first
    let response;
    try {
      response = await fetch(`${baseUrl}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        signal,
        body: JSON.stringify(payload),
      });
    } catch (fetchErr) {
      if (fetchErr.name === "AbortError") throw fetchErr;
      // If /api/chat/stream fails to connect, fallback to /api/chat/message
      response = null;
    }

    // Fallback to standard endpoint if streaming endpoint is unavailable (e.g. 404)
    if (!response || (!response.ok && response.status === 404)) {
      const fallbackData = await postRequest("/api/chat/message", payload, { signal });
      const answer =
        fallbackData.assistantMessage?.content ||
        fallbackData.answer ||
        fallbackData.content ||
        "";
      const citations =
        fallbackData.assistantMessage?.citations ||
        fallbackData.citations ||
        [];

      if (citations.length > 0 && onCitation) onCitation(citations);
      if (onToken) onToken(answer, answer);
      if (onComplete) onComplete(answer, fallbackData);
      return answer;
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(
        errorJson.message ||
        errorJson.error ||
        `Chat request failed with status ${response.status}`
      );
    }

    // If server returned plain JSON instead of event-stream
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      const answer = data.assistantMessage?.content || data.answer || data.content || "";
      const citations = data.assistantMessage?.citations || data.citations || [];
      if (citations.length > 0 && onCitation) onCitation(citations);
      if (onToken) onToken(answer, answer);
      if (onComplete) onComplete(answer, data);
      return answer;
    }

    // Process ReadableStream (SSE events)
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("event: citations") || trimmed.startsWith("event: citation")) {
          // Next line contains data
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          const rawData = trimmed.slice(6).trim();
          if (rawData === "[DONE]") {
            if (onComplete) onComplete(accumulatedText);
            return accumulatedText;
          }

          try {
            const parsed = JSON.parse(rawData);
            if (parsed.token) {
              accumulatedText += parsed.token;
              if (onToken) onToken(parsed.token, accumulatedText);
            } else if (parsed.content) {
              accumulatedText += parsed.content;
              if (onToken) onToken(parsed.content, accumulatedText);
            } else if (parsed.text) {
              accumulatedText += parsed.text;
              if (onToken) onToken(parsed.text, accumulatedText);
            }

            if (parsed.citations && onCitation) {
              onCitation(parsed.citations);
            }
          } catch {
            // Raw text token chunk
            accumulatedText += rawData;
            if (onToken) onToken(rawData, accumulatedText);
          }
        }
      }
    }

    if (onComplete) onComplete(accumulatedText);
    return accumulatedText;
  } catch (error) {
    if (error.name === "AbortError") {
      return accumulatedText;
    }
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Send a chat message or prompt to RAG endpoint (backward-compatible wrapper)
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
 */
export async function getConversations(documentId, config = {}) {
  const params = documentId ? { documentId } : {};
  return getRequest("/api/chat/conversations", params, config);
}

/**
 * Fetch all messages for a specific conversation
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
 */
export async function deleteConversation(conversationId, config = {}) {
  return deleteRequest(`/api/chat/conversations/${conversationId}`, config);
}

/**
 * Edit a specific message's prompt/content
 */
export async function editMessage(id, content, config = {}) {
  return putRequest(`/api/chat/message/${id}`, { content }, config);
}

export const chatApi = {
  streamChatMessage,
  sendMessage,
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
  editMessage,
};

export default chatApi;
