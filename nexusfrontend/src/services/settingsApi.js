import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "@/lib/httpClient";

/**
 * Fetch settings configuration
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function getSettingsConfig(config = {}) {
  return getRequest("/api/settings/config", {}, config);
}

/**
 * Save / update neural engine API key configuration
 * @param {object} data
 * @param {string} data.provider - AI Provider (e.g. 'openai', 'gemini')
 * @param {string} data.apiKey - API Key
 * @param {boolean} [data.useCustomKeys] - Custom keys flag
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function saveNeuralKey(data, config = {}) {
  return putRequest("/api/settings/neural-keys", data, config);
}

/**
 * Clear chat history logs in the vault
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function clearChatLogs(config = {}) {
  return deleteRequest("/api/settings/vault/chat-history", config);
}

/**
 * Reindex all assets and knowledge embeddings
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function reindexAssets(config = {}) {
  return postRequest("/api/settings/vault/reindex", {}, config);
}

/**
 * Purge entire vault permanently
 * @param {object} [config={}]
 * @returns {Promise<any>}
 */
export async function purgeVault(config = {}) {
  return deleteRequest("/api/settings/vault/purge-all", config);
}

// Aliases for compatibility
export const getConfig = getSettingsConfig;

export const settingsApi = {
  getSettingsConfig,
  getConfig,
  saveNeuralKey,
  clearChatLogs,
  reindexAssets,
  purgeVault,
};

export default settingsApi;
