import User from "../auth/auth.model.js";
import Document from "../rag/documents.model.js";
import DocumentChunk from "../rag/documentChunks.model.js";
import DocumentTree from "../models/DocumentTree.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
} from "../utils/cryptoVault.js";
import { getEmbedding } from "../rag/rag.controller.js";

// GET /api/settings/config
export const getSettingsConfig = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "customLlmConfig generalPreferences",
    );

    const openAiConfigured = !!user?.customLlmConfig?.openaiKey;
    const geminiConfigured = !!user?.customLlmConfig?.geminiKey;

    return res.status(200).json({
      success: true,
      data: {
        provider: user?.customLlmConfig?.preferredProvider || "openai",
        useCustomKeys: user?.customLlmConfig?.useCustomKeys || false,
        openai: {
          configured: openAiConfigured,
          maskedKey: openAiConfigured
            ? maskSecret(decryptSecret(user.customLlmConfig.openaiKey))
            : "",
        },
        gemini: {
          configured: geminiConfigured,
          maskedKey: geminiConfigured
            ? maskSecret(decryptSecret(user.customLlmConfig.geminiKey))
            : "",
        },
        general: user?.generalPreferences || {
          theme: "light",
          language: "en",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings/neural-keys
export const updateNeuralKey = async (req, res) => {
  try {
    const { provider, apiKey, useCustomKeys } = req.body;
    const userId = req.user._id;

    if (!["openai", "gemini"].includes(provider)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid provider specified." });
    }

    const updateFields = {
      "customLlmConfig.preferredProvider": provider,
      "customLlmConfig.useCustomKeys":
        useCustomKeys !== undefined ? useCustomKeys : true,
    };

    if (apiKey && apiKey.trim()) {
      const encryptedKey = encryptSecret(apiKey.trim());
      if (provider === "openai") {
        updateFields["customLlmConfig.openaiKey"] = encryptedKey;
      } else {
        updateFields["customLlmConfig.geminiKey"] = encryptedKey;
      }
    }

    await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

    return res.status(200).json({
      success: true,
      message: `${provider === "openai" ? "OpenAI" : "Gemini"} key securely stored in vault.`,
      maskedKey: apiKey ? maskSecret(apiKey.trim()) : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/settings/vault/chat-history
export const purgeChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId }).select("_id");
    const conversationIds = conversations.map((c) => c._id);

    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Chat logs and session traces purged successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/settings/vault/reindex
export const reindexWorkspaceAssets = async (req, res) => {
  try {
    const userId = req.user._id;
    const chunks = await DocumentChunk.find({ userId });

    let reindexedCount = 0;
    for (const chunk of chunks) {
      if (chunk.text) {
        const freshVector = await getEmbedding(chunk.text);
        chunk.embedding = freshVector;
        await chunk.save();
        reindexedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Re-indexing complete. ${reindexedCount} vectors refreshed.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/settings/vault/purge-all
export const purgeAllVaultData = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId }).select("_id");
    const conversationIds = conversations.map((c) => c._id);

    await Promise.all([
      DocumentChunk.deleteMany({ userId }),
      Document.deleteMany({ userId }),
      DocumentTree.deleteMany({ userId }),
      Message.deleteMany({ conversationId: { $in: conversationIds } }),
      Conversation.deleteMany({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Total database purge complete. All vectors and documents removed.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
