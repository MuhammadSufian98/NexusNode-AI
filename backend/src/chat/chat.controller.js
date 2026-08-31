import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from "../models/message.model.js";
import User from "../auth/auth.model.js";
import Document from "../rag/documents.model.js";
import DocumentChunk from "../rag/documentChunks.model.js";
import { getEmbedding } from "../rag/rag.controller.js";
import { scoreAndSortChunks } from "../utils/vectorMath.js";
import { decryptSecret } from "../utils/cryptoVault.js";
import groq from "../utils/groq.js";

/**
 * Retrieve relevant chunks with hybrid fallback & deduplication
 */
export const retrieveRelevantChunks = async ({
  queryText,
  userId,
  documentId,
  queryVector,
  limit = 10,
  minSimilarity = 0.45,
}) => {
  let vectorResults = [];

  // 1. Vector Search Query scoped strictly to userId and documentId
  if (documentId && mongoose.Types.ObjectId.isValid(documentId)) {
    try {
      vectorResults = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 150,
            limit: limit * 2,
            filter: {
              userId: new mongoose.Types.ObjectId(userId),
              documentId: new mongoose.Types.ObjectId(documentId),
            },
          },
        },
        {
          $project: {
            _id: 1,
            text: 1,
            fileName: 1,
            metadata: 1,
            documentId: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);
    } catch (vectorSearchError) {
      console.warn(
        `Vector search failed for document, falling back to in-memory: ${vectorSearchError.message}`,
      );
      const allChunks = await DocumentChunk.find({
        userId: new mongoose.Types.ObjectId(userId),
        documentId: new mongoose.Types.ObjectId(documentId),
      }).lean();

      const scored = scoreAndSortChunks(queryVector, allChunks, limit * 2);
      const allChunksMap = new Map(allChunks.map((c) => [c._id.toString(), c]));
      vectorResults = scored.map((r) => {
        const original = allChunksMap.get(r._id.toString());
        return {
          ...r,
          documentId: original ? original.documentId : undefined,
        };
      });
    }
  }

  // Similarity Threshold Filtering
  const filteredVectorResults = vectorResults.filter((chunk) => {
    const score = Number(chunk.score);
    return !isNaN(score) && score >= minSimilarity;
  });

  let finalResults = [...filteredVectorResults];

  // 2. Lexical Keyword Fallback (if vector hits are fewer than 5)
  if (finalResults.length < 5) {
    const stopwords = new Set([
      "a",
      "about",
      "above",
      "after",
      "again",
      "against",
      "all",
      "am",
      "an",
      "and",
      "any",
      "are",
      "aren't",
      "as",
      "at",
      "be",
      "because",
      "been",
      "before",
      "being",
      "below",
      "between",
      "both",
      "but",
      "by",
      "can",
      "can't",
      "cannot",
      "could",
      "couldn't",
      "did",
      "didn't",
      "do",
      "does",
      "doesn't",
      "doing",
      "don't",
      "down",
      "during",
      "each",
      "few",
      "for",
      "from",
      "further",
      "had",
      "hadn't",
      "has",
      "hasn't",
      "have",
      "haven't",
      "having",
      "he",
      "he'd",
      "he'll",
      "he's",
      "her",
      "here",
      "here's",
      "hers",
      "herself",
      "him",
      "himself",
      "his",
      "how",
      "how's",
      "i",
      "i'd",
      "i'll",
      "i'm",
      "i've",
      "if",
      "in",
      "into",
      "is",
      "isn't",
      "it",
      "it's",
      "its",
      "itself",
      "let's",
      "me",
      "more",
      "most",
      "mustn't",
      "my",
      "myself",
      "no",
      "nor",
      "not",
      "of",
      "off",
      "on",
      "once",
      "only",
      "or",
      "other",
      "ought",
      "our",
      "ours",
      "ourselves",
      "out",
      "over",
      "own",
      "same",
      "shan't",
      "she",
      "she'd",
      "she'll",
      "she's",
      "should",
      "shouldn't",
      "so",
      "some",
      "such",
      "than",
      "that",
      "that's",
      "the",
      "their",
      "theirs",
      "them",
      "themselves",
      "then",
      "there",
      "there's",
      "these",
      "they",
      "they'd",
      "they'll",
      "they're",
      "they've",
      "this",
      "those",
      "through",
      "to",
      "too",
      "under",
      "until",
      "up",
      "very",
      "was",
      "wasn't",
      "we",
      "we'd",
      "we'll",
      "we're",
      "we've",
      "were",
      "weren't",
      "what",
      "what's",
      "when",
      "when's",
      "where",
      "where's",
      "which",
      "while",
      "who",
      "who's",
      "whom",
      "why",
      "why's",
      "with",
      "won't",
      "would",
      "wouldn't",
      "you",
      "you'd",
      "you'll",
      "you're",
      "you've",
      "your",
      "yours",
      "yourself",
      "yourselves",
    ]);

    const words = queryText.toLowerCase().match(/\w+/g) || [];
    const keywords = [
      ...new Set(words.filter((w) => w.length > 2 && !stopwords.has(w))),
    ];

    const lexicalFilter = {
      userId: new mongoose.Types.ObjectId(userId),
      documentId: new mongoose.Types.ObjectId(documentId),
    };

    if (keywords.length > 0) {
      lexicalFilter.$or = keywords.map((kw) => ({
        text: { $regex: kw, $options: "i" },
      }));
    } else {
      lexicalFilter.text = { $regex: queryText, $options: "i" };
    }

    try {
      const lexicalResults = await DocumentChunk.find(lexicalFilter)
        .limit(limit)
        .lean();

      // Deduplication
      const seenIds = new Set(finalResults.map((r) => r._id.toString()));
      for (const chunk of lexicalResults) {
        const idStr = chunk._id.toString();
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          chunk.score = 0.5;
          finalResults.push(chunk);
        }
      }
    } catch (lexicalError) {
      console.error(`Lexical lookup failed: ${lexicalError.message}`);
    }
  }

  return finalResults.slice(0, limit);
};

/**
 * Handle incoming chat message (Clean REST API)
 */
export const handleChatMessage = async (req, res) => {
  const {
    conversationId,
    sessionId,
    documentId,
    workspace_id,
    message,
    prompt,
    content,
  } = req.body;
  const queryText = message || content || prompt;
  const targetConvId = conversationId || sessionId;

  try {
    if (!queryText) {
      return res.status(400).json({
        success: false,
        message: "Prompt or message text is required.",
      });
    }

    let conversation;
    let resolvedDocId = documentId || workspace_id;
    if (resolvedDocId === "undefined") resolvedDocId = undefined;

    // 1. Resolve conversation if provided
    if (targetConvId && targetConvId !== "undefined") {
      if (!mongoose.Types.ObjectId.isValid(targetConvId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid conversationId." });
      }
      conversation = await Conversation.findOne({
        _id: targetConvId,
        userId: req.user._id,
      });

      if (!conversation) {
        return res
          .status(404)
          .json({ success: false, message: "Conversation session not found." });
      }
      resolvedDocId = conversation.documentId;
    }

    // 2. Validate Document ID
    if (
      !resolvedDocId ||
      resolvedDocId === "undefined" ||
      !mongoose.Types.ObjectId.isValid(resolvedDocId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "A valid documentId is required." });
    }

    // 3. Verify parent document readiness
    const parentDoc = await Document.findOne({
      _id: resolvedDocId,
      userId: req.user._id,
    });
    if (!parentDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }
    if (parentDoc.status !== "ready") {
      return res.status(400).json({
        success: false,
        message:
          "Document is still processing or has failed embedding generation.",
      });
    }

    // 4. Auto-create conversation if none existed
    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.user._id,
        documentId: new mongoose.Types.ObjectId(resolvedDocId),
        workspace_id:
          workspace_id && mongoose.Types.ObjectId.isValid(workspace_id)
            ? new mongoose.Types.ObjectId(workspace_id)
            : undefined,
        title:
          queryText.slice(0, 35) || parentDoc.fileName || "New Chat Session",
      });
    }

    // 5. Generate Query Embedding & Retrieve Chunks
    const queryVector = await getEmbedding(queryText);
    const results = await retrieveRelevantChunks({
      queryText,
      userId: req.user._id,
      documentId: resolvedDocId,
      queryVector,
      limit: 10,
      minSimilarity: 0.45,
    });

    const contextBlocks = results
      .map(
        (chunk, i) =>
          `[Source ${i + 1} | File: ${chunk.fileName || "Document.pdf"}${
            chunk.metadata?.page ? ` | Page: ${chunk.metadata.page}` : ""
          }]\n${chunk.text}`,
      )
      .join("\n\n");

    const systemPrompt = `You are the advanced document intelligence engine for NexusNode AI.
Answer the user's prompt using the provided document excerpts.

=== SEMANTIC CONTEXT BLOCKS ===
${contextBlocks || "No direct matching excerpts found. Provide a concise analytical answer based on standard technical understanding."}
===============================

CRITICAL RULES:
1. Grounding & Fidelity: Base your answer strictly on the provided context excerpts. Do not fabricate facts, rates, or constraints not present in the text.
2. Table & Rate Precision:
   - When extracting data from pricing or rules tables, inspect the exact column headers carefully (e.g., distinguish between "Price per hour" and a flat "Price" / fixed session charge).
   - If a rate is a flat/fixed fee for a time period, do NOT multiply it by the number of hours parked/stayed unless explicitly defined as an hourly rate.
   - Respect maximum stay and time-window rules strictly (e.g., "Up to Midnight" vs. fixed hour limits).
3. Arithmetic & Logic:
   - Perform step-by-step arithmetic when calculating costs, totals, or discounts.
   - Verify discount percentages against the exact arrival/time window conditions defined in the source before applying them.
4. Structure: Present information clearly using clean Markdown formatting (bold key figures, bullet points, and concise breakdown tables where helpful).`;

    // 6. Build Message History
    const previousMessages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: queryText },
    ];

    const citations = results.map((chunk) => ({
      documentId: chunk.documentId
        ? chunk.documentId.toString()
        : chunk._id.toString(),
      fileName: chunk.fileName || "Document.pdf",
      pageNumber: chunk.metadata?.page || 1,
      snippet: (chunk.text || "").slice(0, 200),
    }));

    // 7. Check for User Custom BYOK Configuration
    const userRecord = await User.findById(req.user._id).select(
      "customLlmConfig",
    );
    const useCustomKeys = userRecord?.customLlmConfig?.useCustomKeys;
    const provider = userRecord?.customLlmConfig?.preferredProvider;

    let assistantResponseText = "";
    let executionSuccess = false;

    // A. Custom OpenAI Route
    if (
      useCustomKeys &&
      provider === "openai" &&
      userRecord?.customLlmConfig?.openaiKey
    ) {
      const decryptedOpenAIKey = decryptSecret(
        userRecord.customLlmConfig.openaiKey,
      );
      if (decryptedOpenAIKey) {
        try {
          console.log("[Inference] Routing through Custom User OpenAI Key");
          const customOpenAI = new OpenAI({ apiKey: decryptedOpenAIKey });
          const completion = await customOpenAI.chat.completions.create({
            messages: groqMessages,
            model: "gpt-4o",
            temperature: 0.2,
          });
          assistantResponseText =
            completion.choices[0]?.message?.content || "No response generated.";
          executionSuccess = true;
        } catch (openAiError) {
          console.warn(
            `[Inference] Custom OpenAI execution failed: ${openAiError.message}. Falling back to default pipeline.`,
          );
        }
      }
    }

    // B. Custom Gemini Route
    if (
      !executionSuccess &&
      useCustomKeys &&
      provider === "gemini" &&
      userRecord?.customLlmConfig?.geminiKey
    ) {
      const decryptedGeminiKey = decryptSecret(
        userRecord.customLlmConfig.geminiKey,
      );
      if (decryptedGeminiKey) {
        try {
          console.log("[Inference] Routing through Custom User Gemini Key");
          const genAI = new GoogleGenerativeAI(decryptedGeminiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt,
          });

          // Reconstruct multi-turn chat history for Google Generative AI
          const geminiHistory = previousMessages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          }));

          const chat = model.startChat({ history: geminiHistory });
          const result = await chat.sendMessage(queryText);
          assistantResponseText = result.response.text();
          executionSuccess = true;
        } catch (geminiError) {
          console.warn(
            `[Inference] Custom Gemini execution failed: ${geminiError.message}. Falling back to default pipeline.`,
          );
        }
      }
    }

    // C. Default Groq Fallback Pipeline
    if (!executionSuccess) {
      const activeModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
      ];

      let lastError = null;

      for (const modelName of activeModels) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: groqMessages,
            model: modelName,
            temperature: 0.2,
            max_tokens: 1500,
          });

          if (chatCompletion?.choices?.[0]?.message?.content) {
            assistantResponseText = chatCompletion.choices[0].message.content;
            executionSuccess = true;
            break;
          }
        } catch (err) {
          console.warn(`[LLM Call] Model ${modelName} failed: ${err.message}`);
          lastError = err;
        }
      }

      if (!executionSuccess) {
        throw new Error(
          lastError?.message || "All fallback LLM models failed to respond.",
        );
      }
    }

    // 8. Persist Messages & Update Session Timestamp
    const userMsg = await Message.create({
      conversationId: conversation._id,
      userId: req.user._id,
      role: "user",
      content: queryText,
      citations: [],
    });

    const assistantMsg = await Message.create({
      conversationId: conversation._id,
      userId: req.user._id,
      role: "assistant",
      content: assistantResponseText,
      citations,
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: queryText.slice(0, 60),
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      answer: assistantResponseText,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      citations,
      conversationId: conversation._id,
      sessionId: conversation._id,
    });
  } catch (error) {
    console.error(`[Chat Message] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process chat message.",
    });
  }
};

/**
 * Create a new Conversation session
 */
export const createConversation = async (req, res) => {
  console.log(`[Session Create] Payload:`, req.body);
  try {
    const { title } = req.body;
    const docId = req.body.documentId || req.body.workspace_id;

    if (
      !docId ||
      docId === "undefined" ||
      !mongoose.Types.ObjectId.isValid(docId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "A valid documentId is required." });
    }

    const doc = await Document.findOne({ _id: docId, userId: req.user._id });
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }
    if (doc.status !== "ready") {
      return res.status(400).json({
        success: false,
        message: "Document is not ready or failed processing.",
      });
    }

    const conversation = await Conversation.create({
      userId: req.user._id,
      documentId: new mongoose.Types.ObjectId(docId),
      workspace_id: docId,
      title: title || "New Chat Session",
      lastMessage: "",
    });

    return res.status(201).json({
      success: true,
      conversation,
      session: conversation, // Alias support for frontend
    });
  } catch (error) {
    console.error(`[Session Create] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create session.",
    });
  }
};

/**
 * Get all conversations for a user & document
 */
export const getUserConversations = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    const docId = req.query.documentId || req.query.workspace_id;

    if (docId && mongoose.Types.ObjectId.isValid(docId)) {
      filter.documentId = new mongoose.Types.ObjectId(docId);
    }

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      conversations,
      sessions: conversations, // Alias support for frontend
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch conversations.",
    });
  }
};

/**
 * Get message history for a conversation
 */
export const getConversationMessages = async (req, res) => {
  try {
    const targetConvId = req.params.conversationId || req.params.sessionId;

    if (!mongoose.Types.ObjectId.isValid(targetConvId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID." });
    }

    const conversation = await Conversation.findOne({
      _id: targetConvId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found." });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages.",
    });
  }
};

/**
 * Delete a conversation session and all its messages
 */
export const deleteConversation = async (req, res) => {
  try {
    const targetConvId =
      req.params.id || req.params.conversationId || req.params.sessionId;

    const conversation = await Conversation.findOne({
      _id: targetConvId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found." });
    }

    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.deleteOne({ _id: conversation._id });

    return res
      .status(200)
      .json({ success: true, message: "Conversation deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete conversation.",
    });
  }
};

/**
 * Edit an existing user prompt and re-run retrieval
 */
export const editChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required." });
    }

    const userMessage = await Message.findById(id);
    if (!userMessage || userMessage.role !== "user") {
      return res
        .status(404)
        .json({ success: false, message: "User message not found." });
    }

    const conversation = await Conversation.findOne({
      _id: userMessage.conversationId,
      userId: req.user._id,
    });
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to conversation.",
      });
    }

    const resolvedDocId = conversation.documentId;
    const queryVector = await getEmbedding(content);

    const results = await retrieveRelevantChunks({
      queryText: content,
      userId: req.user._id,
      documentId: resolvedDocId,
      queryVector,
      limit: 5,
      minSimilarity: 0.65,
    });

    const contextBlocks = results
      .map(
        (chunk, i) =>
          `[Source ${i + 1} | File: ${chunk.fileName || "Document.pdf"}]\n${chunk.text}`,
      )
      .join("\n\n");

    const systemPrompt = `You are the advanced document intelligence engine for NexusNode AI.
Answer the user's prompt using only the provided semantic text context blocks.

=== SEMANTIC CONTEXT BLOCKS ===
${contextBlocks}
===============================`;

    const previousMessages = await Message.find({
      conversationId: conversation._id,
      createdAt: { $lt: userMessage.createdAt },
    })
      .sort({ createdAt: 1 })
      .lean();

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 1200,
    });

    const assistantResponseText =
      chatCompletion.choices[0]?.message?.content || "No response generated.";

    const citations = results.map((chunk) => ({
      documentId: chunk.documentId
        ? chunk.documentId.toString()
        : chunk._id.toString(),
      fileName: chunk.fileName || "Document.pdf",
      pageNumber: chunk.metadata?.page || 1,
      snippet: (chunk.text || "").slice(0, 200),
    }));

    const assistantMessage = await Message.findOne({
      conversationId: conversation._id,
      role: "assistant",
      createdAt: { $gte: userMessage.createdAt },
    }).sort({ createdAt: 1 });

    const now = new Date();
    userMessage.content = content;
    userMessage.isEdited = true;
    userMessage.createdAt = now;
    await userMessage.save();

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: content.slice(0, 60),
      updatedAt: now,
    });

    let updatedAssistantMessage;
    if (assistantMessage) {
      assistantMessage.content = assistantResponseText;
      assistantMessage.citations = citations;
      assistantMessage.createdAt = now;
      await assistantMessage.save();
      updatedAssistantMessage = assistantMessage;
    } else {
      updatedAssistantMessage = await Message.create({
        conversationId: conversation._id,
        userId: req.user._id,
        role: "assistant",
        content: assistantResponseText,
        citations,
        createdAt: now,
      });
    }

    return res.status(200).json({
      success: true,
      userMessage,
      assistantMessage: updatedAssistantMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to edit chat message.",
    });
  }
};
