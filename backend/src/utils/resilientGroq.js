// Default verified fallback Groq production chat models
export const DEFAULT_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

let cachedWorkingModel = null;

/**
 * Parses and returns the ordered Groq model fallback hierarchy from environment,
 * defaulting to verified production models if unspecified.
 */
export const getGroqModelCascade = () => {
  if (process.env.GROQ_MODELS) {
    const parsed = process.env.GROQ_MODELS.split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      return parsed;
    }
  }
  return [...DEFAULT_GROQ_MODELS];
};

/**
 * Dynamically queries Groq API for currently active chat completion models.
 * Filters out non-chat, audio, embedding, and terms-gated models.
 * Returns an ordered array of valid candidate model IDs.
 */
export async function getLiveAvailableModels(groqClient) {
  try {
    const response = await groqClient.models.list();
    const models = response.data || [];

    // Filter out non-chat, audio, embedding, or gated models:
    // Ignore any model with whisper, guard, orpheus, embed, or vision in its ID
    const nonGatedChatModels = models.filter((m) => {
      if (m.active === false) return false;
      const id = String(m.id || "").toLowerCase();
      return (
        !id.includes("whisper") &&
        !id.includes("guard") &&
        !id.includes("orpheus") &&
        !id.includes("embed") &&
        !id.includes("vision")
      );
    });

    if (nonGatedChatModels.length === 0) return [];

    // Only accept models owned by meta-llama, mistralai, or google that end with common chat tags
    // (e.g., -versatile, -instant, -it, -instruct)
    const primaryCandidates = nonGatedChatModels.filter((m) => {
      const id = String(m.id || "").toLowerCase();
      const owner = String(m.owned_by || "").toLowerCase();

      const isAllowedOwner =
        owner.includes("meta-llama") ||
        owner.includes("meta") ||
        owner.includes("mistralai") ||
        owner.includes("mistral") ||
        owner.includes("google") ||
        id.startsWith("meta-llama/") ||
        id.startsWith("mistralai/") ||
        id.startsWith("google/");

      const hasChatTag = /(-versatile|-instant|-it|-instruct)$/i.test(m.id);
      return isAllowedOwner && hasChatTag;
    });

    if (primaryCandidates.length > 0) {
      console.log(`[Groq Auto-Discovery] Found primary chat candidates: ${primaryCandidates.map(m => m.id).join(", ")}`);
    }

    // Secondary candidates: open chat models in the Groq catalog (e.g., openai/gpt-oss, qwen, etc.)
    const secondaryCandidates = nonGatedChatModels
      .filter((m) => {
        const id = String(m.id || "").toLowerCase();
        return id.includes("gpt-oss") || id.includes("llama") || id.includes("qwen") || id.includes("allam");
      })
      .sort((a, b) => {
        // Prioritize large high-context models first
        if (a.id.includes("120b")) return -1;
        if (b.id.includes("120b")) return 1;
        if (a.id.includes("20b")) return -1;
        if (b.id.includes("20b")) return 1;
        return 0;
      });

    const orderedUnique = Array.from(
      new Set([
        ...primaryCandidates.map((m) => m.id),
        ...secondaryCandidates.map((m) => m.id),
      ])
    );

    return orderedUnique;
  } catch (err) {
    console.error("[Groq Auto-Discovery] Failed to query live models:", err.message);
    return [];
  }
}

/**
 * Returns the first available chat model from the live catalog.
 */
export async function getLiveAvailableModel(groqClient) {
  const models = await getLiveAvailableModels(groqClient);
  return models[0] || null;
}

/**
 * Resilient wrapper around groq.chat.completions.create
 * Automatically catches model deprecation, terms requirements, or decommission issues
 * and rotates smoothly through fallback cascades.
 */
export async function createResilientGroqCompletion(groqClient, params) {
  const maxTokens = Number(process.env.GROQ_MAX_TOKENS) || 1024;
  const executionParams = {
    ...params,
    max_tokens: params.max_tokens || maxTokens,
    temperature: params.temperature !== undefined ? params.temperature : 0.2,
  };

  const configuredCascade = getGroqModelCascade();

  // Dynamic candidate chain starting with currently cached working model
  const candidates = Array.from(
    new Set([
      cachedWorkingModel,
      params.model,
      ...configuredCascade,
    ].filter(Boolean))
  );

  let lastError = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidateModel = candidates[i];
    try {
      const response = await groqClient.chat.completions.create({
        ...executionParams,
        model: candidateModel,
      });

      // Update cached working model for subsequent fast requests
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
        errorCode === "model_terms_required" ||
        errorCode === "model_not_found" ||
        errorMsg.includes("decommissioned") ||
        errorMsg.includes("does not exist") ||
        errorMsg.includes("no longer supported") ||
        errorMsg.includes("terms acceptance") ||
        errorMsg.includes("do not have access") ||
        error?.status === 400 ||
        error?.status === 404;

      if (isModelIssue) {
        console.warn(
          `[Groq Resilience] Model '${candidateModel}' failed (${errorCode || "incompatible"}). Attempting fallback...`
        );
        continue;
      }

      // If it's an unrecoverable auth error or fatal prompt error, throw immediately
      throw error;
    }
  }

  // If all static candidates failed, query Groq live model catalog API dynamically
  console.warn("[Groq Resilience] All static fallbacks failed. Querying Groq Live Catalog...");
  const liveModels = await getLiveAvailableModels(groqClient);

  for (let j = 0; j < liveModels.length; j++) {
    const liveModel = liveModels[j];
    if (candidates.includes(liveModel)) continue;

    try {
      const tokenLimit = liveModel.includes("qwen")
        ? Math.min(executionParams.max_tokens, 1000)
        : executionParams.max_tokens;

      const response = await groqClient.chat.completions.create({
        ...executionParams,
        max_tokens: tokenLimit,
        model: liveModel,
      });

      console.log(`[Groq Resilience] Working live model established: ${liveModel}`);
      cachedWorkingModel = liveModel;
      return response;
    } catch (liveErr) {
      lastError = liveErr;
      const errDetail = liveErr?.error?.message || liveErr?.message || "";
      console.warn(`[Groq Resilience] Live candidate '${liveModel}' failed (${errDetail}). Trying next...`);
    }
  }

  // Sanitize internal server keys from thrown error
  const sanitizedMessage = (lastError?.error?.message || lastError?.message || "All fallback LLM models failed to respond.")
    .replace(/gsk_[a-zA-Z0-9_-]+/g, "[REDACTED]")
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[REDACTED]");

  const cleanError = new Error(sanitizedMessage);
  cleanError.status = lastError?.status || 500;
  throw cleanError;
}
