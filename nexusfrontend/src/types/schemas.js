/**
 * @file Unified application schemas, JSDoc type contracts, default initializers,
 * and formatters/validators for NexusNode AI.
 */

// =============================================================================
// JSDOC TYPE DEFINITIONS (TypeScript IDE Contracts)
// =============================================================================

/**
 * @typedef {Object} Citation
 * @property {string} [documentId] - Parent document identifier
 * @property {string} [fileName] - Original document file name
 * @property {number} [pageNumber] - Page number where citation occurs
 * @property {string} [textSnippet] - Snippet of cited text
 * @property {string} [snippet] - Alias for textSnippet
 */

/**
 * @typedef {Object} DocumentSchema
 * @property {string} id - Unique document identifier
 * @property {string} name - Document file name or display name
 * @property {string} title - Document title
 * @property {string} pdfUrl - URL/path to access the PDF file
 * @property {string} workspace_id - Workspace or collection identifier
 * @property {string|number} size - Human-readable or byte size (e.g. "1.2 MB")
 * @property {number} pages - Number of pages in the document
 * @property {string|Date} uploadedAt - ISO timestamp or Date of upload
 * @property {"ready"|"pending"|"processing"|"error"} status - Processing state
 * @property {string} errorMessage - Error description if processing failed
 */

/**
 * @typedef {Object} ChunkSchema
 * @property {string} id - Unique chunk/vector identifier
 * @property {string} documentId - ID of parent document
 * @property {string} text - Full text content of chunk
 * @property {string} fileName - File name of parent document
 * @property {number} pageNumber - Page number where chunk resides
 * @property {number} score - Semantic similarity/relevance score
 * @property {string} snippet - Highlighted or shortened preview snippet
 */

/**
 * @typedef {Object} ConversationSchema
 * @property {string} id - Unique conversation/session identifier
 * @property {string} documentId - Associated document or workspace ID
 * @property {string} title - Conversation title
 * @property {string} lastMessage - Preview text of the most recent message
 * @property {string} updatedAt - ISO timestamp of last activity
 * @property {string} createdAt - ISO timestamp when session was created
 */

/**
 * @typedef {Object} MessageSchema
 * @property {string} id - Unique message identifier
 * @property {"user"|"assistant"|"system"} role - Message sender role
 * @property {string} content - Markdown/text message content
 * @property {Array<Citation>} citations - Attached source citations
 * @property {boolean} isEdited - Whether the message content was edited
 * @property {string} createdAt - ISO timestamp of message creation
 */

/**
 * @typedef {Object} TopicDistributionItem
 * @property {string} name - Category / Topic name
 * @property {number} value - Percentage coverage or count
 * @property {string} [color] - Hex color code for visualization
 */

/**
 * @typedef {Object} OverviewStatsSchema
 * @property {number} totalDocuments - Total documents stored in vault
 * @property {number} readyDocuments - Documents fully indexed and ready for chat
 * @property {number} totalChunks - Total indexed vector chunks
 * @property {number} totalPages - Total pages indexed across all documents
 * @property {string} totalStorageFormatted - Human-readable total storage (e.g. "4.8 MB")
 * @property {string|number} groundingScore - Grounding fidelity score (e.g. "99.4%")
 * @property {Object|null} resumeSession - Quick resume session reference
 * @property {Array<TopicDistributionItem>} topicDistribution - Breakdown of topics
 */

/**
 * @typedef {Object} ProviderConfig
 * @property {boolean} configured - Whether custom key is saved and active
 * @property {string} maskedKey - Obfuscated key preview (e.g. "sk-...ab12")
 * @property {string} [apiKey] - Raw API key (for transient forms)
 * @property {string} [model] - Selected model name
 */

/**
 * @typedef {Object} GeneralPreferences
 * @property {"light"|"dark"|"system"} theme - UI theme preference
 * @property {string} language - Interface language code (e.g. "en")
 * @property {boolean} notifications - Whether toast/app notifications are enabled
 */

/**
 * @typedef {Object} SettingsConfigSchema
 * @property {string} provider - Active neural engine ("openai" | "gemini")
 * @property {boolean} useCustomKeys - Whether user-provided API keys are enabled
 * @property {ProviderConfig} openai - OpenAI configuration
 * @property {ProviderConfig} gemini - Google Gemini configuration
 * @property {GeneralPreferences} general - General UI preferences
 */

// =============================================================================
// DEFAULT OBJECTS (Structural Blueprints)
// =============================================================================

export const DEFAULT_DOCUMENT = Object.freeze({
  id: "",
  name: "Untitled Document",
  title: "Untitled Document",
  pdfUrl: "",
  workspace_id: "",
  size: "0 KB",
  pages: 0,
  uploadedAt: new Date().toISOString(),
  status: "ready",
  errorMessage: "",
});

export const DEFAULT_CHUNK = Object.freeze({
  id: "",
  documentId: "",
  text: "",
  fileName: "",
  pageNumber: 1,
  score: 0,
  snippet: "",
});

export const DEFAULT_CONVERSATION = Object.freeze({
  id: "",
  documentId: "",
  title: "New Conversation",
  lastMessage: "",
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

export const DEFAULT_MESSAGE = Object.freeze({
  id: "",
  role: "user",
  content: "",
  citations: [],
  isEdited: false,
  createdAt: new Date().toISOString(),
});

export const DEFAULT_OVERVIEW_STATS = Object.freeze({
  totalDocuments: 0,
  readyDocuments: 0,
  totalChunks: 0,
  totalPages: 0,
  totalStorageFormatted: "0 KB",
  groundingScore: "99.4%",
  resumeSession: null,
  topicDistribution: [],
});

export const DEFAULT_SETTINGS_CONFIG = Object.freeze({
  provider: "openai",
  useCustomKeys: false,
  openai: {
    configured: false,
    maskedKey: "",
    model: "gpt-4o",
  },
  gemini: {
    configured: false,
    maskedKey: "",
    model: "gemini-1.5-pro",
  },
  general: {
    theme: "light",
    language: "en",
    notifications: true,
  },
});

// =============================================================================
// FACTORY FUNCTIONS (Default Initializers)
// =============================================================================

/**
 * Creates a new document state object with guaranteed defaults.
 * @param {Partial<DocumentSchema>} [overrides={}]
 * @returns {DocumentSchema}
 */
export function createInitialDocument(overrides = {}) {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_DOCUMENT,
    id: overrides.id || overrides._id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: overrides.fileName || overrides.name || DEFAULT_DOCUMENT.name,
    title: overrides.title || overrides.fileName || overrides.name || DEFAULT_DOCUMENT.title,
    pdfUrl: overrides.pdfUrl || "",
    workspace_id: overrides.workspace_id || overrides.documentId || "",
    size: overrides.size || DEFAULT_DOCUMENT.size,
    pages: typeof overrides.pages === "number" ? overrides.pages : 0,
    uploadedAt: overrides.uploadedAt || overrides.createdAt || now,
    status: overrides.status || DEFAULT_DOCUMENT.status,
    errorMessage: overrides.errorMessage || "",
    ...overrides,
  };
}

/**
 * Creates a new chunk/vector object with guaranteed defaults.
 * @param {Partial<ChunkSchema>} [overrides={}]
 * @returns {ChunkSchema}
 */
export function createInitialChunk(overrides = {}) {
  return {
    ...DEFAULT_CHUNK,
    id: overrides.id || overrides._id || `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    documentId: overrides.documentId || "",
    text: overrides.text || overrides.content || "",
    fileName: overrides.fileName || "",
    pageNumber: typeof overrides.pageNumber === "number" ? overrides.pageNumber : 1,
    score: typeof overrides.score === "number" ? overrides.score : 0,
    snippet: overrides.snippet || overrides.textSnippet || (overrides.text ? overrides.text.slice(0, 160) : ""),
    ...overrides,
  };
}

/**
 * Creates a new conversation state object with guaranteed defaults.
 * @param {Partial<ConversationSchema>} [overrides={}]
 * @returns {ConversationSchema}
 */
export function createInitialConversation(overrides = {}) {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_CONVERSATION,
    id: overrides.id || overrides._id || overrides.conversationId || overrides.sessionId || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    documentId: overrides.documentId || overrides.workspace_id || "",
    title: overrides.title || DEFAULT_CONVERSATION.title,
    lastMessage: overrides.lastMessage || "",
    updatedAt: overrides.updatedAt || now,
    createdAt: overrides.createdAt || now,
    ...overrides,
  };
}

/**
 * Creates a new message object with guaranteed defaults.
 * @param {Partial<MessageSchema>} [overrides={}]
 * @returns {MessageSchema}
 */
export function createInitialMessage(overrides = {}) {
  const rawCitations = Array.isArray(overrides.citations) ? overrides.citations : [];
  const normalizedCitations = rawCitations.map((c) => ({
    documentId: c.documentId || "",
    fileName: c.fileName || "Document.pdf",
    pageNumber: typeof c.pageNumber === "number" ? c.pageNumber : 1,
    textSnippet: c.textSnippet || c.snippet || "",
    snippet: c.snippet || c.textSnippet || "",
  }));

  return {
    ...DEFAULT_MESSAGE,
    id: overrides.id || overrides._id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role: overrides.role === "assistant" || overrides.role === "system" ? overrides.role : "user",
    content: overrides.content || overrides.message || overrides.answer || "",
    citations: normalizedCitations,
    isEdited: Boolean(overrides.isEdited),
    createdAt: overrides.createdAt || new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a new overview dashboard state object with guaranteed defaults.
 * @param {Partial<OverviewStatsSchema>} [overrides={}]
 * @returns {OverviewStatsSchema}
 */
export function createInitialOverview(overrides = {}) {
  const topicDistribution = Array.isArray(overrides.topicDistribution)
    ? overrides.topicDistribution
    : [];

  return {
    ...DEFAULT_OVERVIEW_STATS,
    totalDocuments: typeof overrides.totalDocuments === "number" ? overrides.totalDocuments : 0,
    readyDocuments: typeof overrides.readyDocuments === "number" ? overrides.readyDocuments : 0,
    totalChunks: typeof overrides.totalChunks === "number" ? overrides.totalChunks : 0,
    totalPages: typeof overrides.totalPages === "number" ? overrides.totalPages : 0,
    totalStorageFormatted: overrides.totalStorageFormatted || DEFAULT_OVERVIEW_STATS.totalStorageFormatted,
    groundingScore: overrides.groundingScore || DEFAULT_OVERVIEW_STATS.groundingScore,
    resumeSession: overrides.resumeSession || null,
    topicDistribution,
    ...overrides,
  };
}

/**
 * Creates a new settings configuration state object with guaranteed defaults.
 * @param {Partial<SettingsConfigSchema>} [overrides={}]
 * @returns {SettingsConfigSchema}
 */
export function createInitialSettings(overrides = {}) {
  return {
    ...DEFAULT_SETTINGS_CONFIG,
    provider: overrides.provider || DEFAULT_SETTINGS_CONFIG.provider,
    useCustomKeys: Boolean(overrides.useCustomKeys),
    openai: {
      ...DEFAULT_SETTINGS_CONFIG.openai,
      ...(overrides.openai || {}),
    },
    gemini: {
      ...DEFAULT_SETTINGS_CONFIG.gemini,
      ...(overrides.gemini || {}),
    },
    general: {
      ...DEFAULT_SETTINGS_CONFIG.general,
      ...(overrides.general || {}),
    },
    ...overrides,
  };
}

// Aliases for convenience & naming conventions
export const createInitialOverviewStats = createInitialOverview;
export const createInitialSettingsConfig = createInitialSettings;

// =============================================================================
// VALIDATION & FORMATTING SCHEMAS
// =============================================================================

/**
 * Validates and formats a raw document API payload into a clean DocumentSchema object.
 * @param {any} raw - Raw API response item
 * @returns {DocumentSchema} Formatted document
 */
export function formatDocument(raw) {
  if (!raw || typeof raw !== "object") return createInitialDocument();
  return createInitialDocument({
    id: raw.id || raw._id,
    name: raw.fileName || raw.name || "Untitled Document",
    title: raw.fileName || raw.title || raw.name || "Untitled Document",
    pdfUrl: raw.pdfUrl || "",
    workspace_id: raw.workspace_id || raw.documentId || "",
    size: raw.size || "N/A",
    pages: typeof raw.pages === "number" ? raw.pages : 0,
    uploadedAt: raw.uploadedAt || raw.createdAt || new Date().toISOString(),
    status: ["ready", "pending", "processing", "error"].includes(raw.status)
      ? raw.status
      : "ready",
    errorMessage: raw.errorMessage || "",
  });
}

/**
 * Validates whether an object adheres to DocumentSchema.
 * @param {any} doc
 * @returns {boolean}
 */
export function validateDocument(doc) {
  return Boolean(
    doc &&
    typeof doc === "object" &&
    typeof doc.id === "string" &&
    typeof doc.name === "string"
  );
}

/**
 * Validates and formats a raw chunk API payload into a clean ChunkSchema object.
 * @param {any} raw - Raw chunk payload
 * @returns {ChunkSchema} Formatted chunk
 */
export function formatChunk(raw) {
  if (!raw || typeof raw !== "object") return createInitialChunk();
  return createInitialChunk({
    id: raw.id || raw._id,
    documentId: raw.documentId || "",
    text: raw.text || raw.content || "",
    fileName: raw.fileName || "",
    pageNumber: Number(raw.pageNumber) || 1,
    score: Number(raw.score) || 0,
    snippet: raw.snippet || raw.textSnippet || "",
  });
}

/**
 * Validates whether an object adheres to ChunkSchema.
 * @param {any} chunk
 * @returns {boolean}
 */
export function validateChunk(chunk) {
  return Boolean(
    chunk &&
    typeof chunk === "object" &&
    typeof chunk.text === "string"
  );
}

/**
 * Validates and formats a raw conversation payload into a clean ConversationSchema object.
 * @param {any} raw - Raw conversation payload
 * @returns {ConversationSchema} Formatted conversation
 */
export function formatConversation(raw) {
  if (!raw || typeof raw !== "object") return createInitialConversation();
  return createInitialConversation({
    id: raw.id || raw._id || raw.conversationId || raw.sessionId,
    documentId: raw.documentId || raw.workspace_id || "",
    title: raw.title || "New Conversation",
    lastMessage: raw.lastMessage || "",
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    createdAt: raw.createdAt || new Date().toISOString(),
  });
}

/**
 * Validates whether an object adheres to ConversationSchema.
 * @param {any} conv
 * @returns {boolean}
 */
export function validateConversation(conv) {
  return Boolean(
    conv &&
    typeof conv === "object" &&
    typeof conv.id === "string"
  );
}

/**
 * Validates and formats a raw message payload into a clean MessageSchema object.
 * @param {any} raw - Raw message payload
 * @returns {MessageSchema} Formatted message
 */
export function formatMessage(raw) {
  if (!raw || typeof raw !== "object") return createInitialMessage();
  return createInitialMessage({
    id: raw.id || raw._id,
    role: raw.role === "assistant" || raw.role === "system" ? raw.role : "user",
    content: raw.content || raw.message || raw.answer || "",
    citations: Array.isArray(raw.citations) ? raw.citations : [],
    isEdited: Boolean(raw.isEdited),
    createdAt: raw.createdAt || new Date().toISOString(),
  });
}

/**
 * Validates whether an object adheres to MessageSchema.
 * @param {any} msg
 * @returns {boolean}
 */
export function validateMessage(msg) {
  return Boolean(
    msg &&
    typeof msg === "object" &&
    typeof msg.role === "string" &&
    typeof msg.content === "string"
  );
}

/**
 * Validates and formats a raw overview stats API response.
 * @param {any} raw - Raw overview stats payload
 * @returns {OverviewStatsSchema} Formatted overview stats
 */
export function formatOverviewStats(raw) {
  if (!raw || typeof raw !== "object") return createInitialOverview();
  return createInitialOverview({
    totalDocuments: Number(raw.totalDocuments) || 0,
    readyDocuments: Number(raw.readyDocuments) || 0,
    totalChunks: Number(raw.totalChunks) || 0,
    totalPages: Number(raw.totalPages) || 0,
    totalStorageFormatted: raw.totalStorageFormatted || "0 KB",
    groundingScore: raw.groundingScore || "99.4%",
    resumeSession: raw.resumeSession || null,
    topicDistribution: Array.isArray(raw.topicDistribution) ? raw.topicDistribution : [],
  });
}

/**
 * Validates and formats a settings configuration payload.
 * @param {any} raw - Raw settings payload
 * @returns {SettingsConfigSchema} Formatted settings configuration
 */
export function formatSettingsConfig(raw) {
  if (!raw || typeof raw !== "object") return createInitialSettings();
  return createInitialSettings({
    provider: raw.provider || "openai",
    useCustomKeys: Boolean(raw.useCustomKeys),
    openai: raw.openai || {},
    gemini: raw.gemini || {},
    general: raw.general || {},
  });
}

// =============================================================================
// COMPOSITE SCHEMAS OBJECT
// =============================================================================

export const Schemas = {
  Document: {
    default: DEFAULT_DOCUMENT,
    create: createInitialDocument,
    format: formatDocument,
    validate: validateDocument,
  },
  Chunk: {
    default: DEFAULT_CHUNK,
    create: createInitialChunk,
    format: formatChunk,
    validate: validateChunk,
  },
  Conversation: {
    default: DEFAULT_CONVERSATION,
    create: createInitialConversation,
    format: formatConversation,
    validate: validateConversation,
  },
  Message: {
    default: DEFAULT_MESSAGE,
    create: createInitialMessage,
    format: formatMessage,
    validate: validateMessage,
  },
  OverviewStats: {
    default: DEFAULT_OVERVIEW_STATS,
    create: createInitialOverview,
    format: formatOverviewStats,
  },
  SettingsConfig: {
    default: DEFAULT_SETTINGS_CONFIG,
    create: createInitialSettings,
    format: formatSettingsConfig,
  },
};

export default Schemas;
