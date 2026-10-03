// Preferred active fallback hierarchy (updated to current stable Groq production models)
const DEFAULT_MODEL_CASCADE = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-3.1-70b-versatile",
  "llama3-70b-8192",
  "llama3-8b-8192",
];

let cachedWorkingModel = null;
let lastDiscoveryTimestamp = 0;
const DISCOVERY_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

/**
 * Dynamically queries Groq API for currently active chat completion models.
 */
export async function getLiveAvailableModel(groqClient) {
  try {
    const response = await groqClient.models.list();
    const models = response.data || [];

    // Filter out Whisper, audio, vision guards, and inactive models
    const activeChatModels = models
      .filter((m) => m.active !== false)
      .map((m) => m.id)
      .filter(
        (id) =>
          !id.includes("whisper") &&
          !id.includes("guard") &&
          !id.includes("vision") &&
          !id.includes("tool-use-preview")
      );

    if (activeChatModels.length === 0) return null;

    // Prioritize 70b versatile or latest llama models
    const preferred =
      activeChatModels.find((id) => id.includes("70b-versatile") || id.includes("llama-3.3")) ||
      activeChatModels.find((id) => id.includes("8b-instant")) ||
      activeChatModels[0];

    console.log(`[Groq Auto-Discovery] Dynamically resolved active model: ${preferred}`);
    return preferred;
  } catch (err) {
    console.error("[Groq Auto-Discovery] Failed to query live models:", err.message);
    return null;
  }
}

/**
 * Resilient wrapper around groq.chat.completions.create
 * Automatically catches model deprecation and rotates through fallbacks.
 */
export async function createResilientGroqCompletion(groqClient, params) {
  // Build dynamic candidate chain starting with currently cached working model
  const candidates = Array.from(
    new Set([
      cachedWorkingModel,
      params.model,
      ...DEFAULT_MODEL_CASCADE,
    ].filter(Boolean))
  );

  let lastError = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidateModel = candidates[i];
    try {
      const response = await groqClient.chat.completions.create({
        ...params,
        model: candidateModel,
      });

      // Update cached working model for subsequent requests
      if (cachedWorkingModel !== candidateModel) {
        console.log(`[Groq Resilience] Working model established: ${candidateModel}`);
        cachedWorkingModel = candidateModel;
      }

      return response;
    } catch (error) {
      lastError = error;
      const errorMsg = error?.error?.message || error?.message || "";
      const errorCode = error?.error?.code || error?.code || "";

      const isModelIssue =
        errorCode === "model_decommissioned" ||
        errorMsg.includes("decommissioned") ||
        errorMsg.includes("does not exist") ||
        errorMsg.includes("no longer supported") ||
        error?.status === 400 ||
        error?.status === 404;

      if (isModelIssue) {
        console.warn(
          `[Groq Resilience] Model '${candidateModel}' failed (${errorCode || "decommissioned"}). Attempting fallback...`
        );
        continue; // Try next model in candidate chain
      }

      // If it's a critical auth or invalid prompt error, throw immediately
      throw error;
    }
  }

  // If all static candidates failed, query Groq live model catalog API dynamically
  console.warn("[Groq Resilience] All static fallbacks failed. Querying Groq Live Catalog...");
  const liveModel = await getLiveAvailableModel(groqClient);

  if (liveModel && !candidates.includes(liveModel)) {
    try {
      const response = await groqClient.chat.completions.create({
        ...params,
        model: liveModel,
      });
      cachedWorkingModel = liveModel;
      return response;
    } catch (finalErr) {
      lastError = finalErr;
    }
  }

  throw lastError;
}
