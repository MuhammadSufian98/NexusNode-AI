import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Document from "../rag/documents.model.js";
import DocumentChunk from "../rag/documentChunks.model.js";
import { getEmbedding } from "../rag/rag.controller.js";
import { scoreAndSortChunks } from "../utils/vectorMath.js";
import groq from "../utils/groq.js";

export const handleChatMessage = async (req, res) => {
  try {
    const { prompt, content, conversationId, documentIds, workspace_id, documentId } = req.body;
    const queryText = content || prompt;
    if (!queryText) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.user._id,
      });
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
    } else {
      conversation = await Conversation.create({
        userId: req.user._id,
        workspace_id: workspace_id ? new mongoose.Types.ObjectId(workspace_id) : undefined,
        documentIds: documentIds || [],
      });
    }

    const queryVector = await getEmbedding(queryText);
    console.log(`[CHECKPOINT 1] Query prompt: "${queryText}", Embedding generated successfully: ${Array.isArray(queryVector)}, Dimension: ${queryVector?.length}`);

    let targetWorkspaceId = workspace_id;
    let targetDocumentIds = [];

    if (documentId) {
      targetDocumentIds.push(documentId);
    }
    if (documentIds && documentIds.length > 0) {
      targetDocumentIds.push(...documentIds);
    }

    if (!targetWorkspaceId && targetDocumentIds.length > 0) {
      const doc = await Document.findById(targetDocumentIds[0]);
      if (doc && doc.workspace_id) {
        targetWorkspaceId = doc.workspace_id.toString();
      }
    } else if (!targetWorkspaceId && conversation && conversation.documentIds && conversation.documentIds.length > 0) {
      const doc = await Document.findById(conversation.documentIds[0]);
      if (doc && doc.workspace_id) {
        targetWorkspaceId = doc.workspace_id.toString();
      }
    }

    console.log(`[CHECKPOINT 2] Query payload: workspace_id: "${workspace_id}", documentId: "${documentId}". Target workspace ID resolved: "${targetWorkspaceId}"`);
    let verificationCount = 0;
    if (targetWorkspaceId && mongoose.Types.ObjectId.isValid(targetWorkspaceId)) {
      verificationCount = await DocumentChunk.countDocuments({ workspace_id: new mongoose.Types.ObjectId(targetWorkspaceId) });
    }
    console.log(`[CHECKPOINT 2] Database cross-reference: found ${verificationCount} chunks matching target workspace ID in DocumentChunk collection`);

    let results = [];
    if (targetWorkspaceId) {
      try {
        results = await DocumentChunk.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 100,
              limit: 5,
              filter: { workspace_id: new mongoose.Types.ObjectId(targetWorkspaceId) },
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              fileName: 1,
              metadata: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);
      } catch (vectorSearchError) {
        const allChunks = await DocumentChunk.find({
          workspace_id: new mongoose.Types.ObjectId(targetWorkspaceId),
        }).lean();
        results = scoreAndSortChunks(queryVector, allChunks, 5);
      }
    }

    if (results.length === 0) {
      try {
        results = await DocumentChunk.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 100,
              limit: 5,
              filter: { userId: req.user._id },
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              fileName: 1,
              metadata: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);
      } catch (vectorSearchError) {
        const allChunks = await DocumentChunk.find({ userId: req.user._id }).lean();
        results = scoreAndSortChunks(queryVector, allChunks, 5);
      }
    }

    console.log(`[CHECKPOINT 3] DB retrieval aggregation/query filter:`, JSON.stringify(targetWorkspaceId ? { workspace_id: targetWorkspaceId } : { userId: req.user._id }, null, 2));
    console.log(`[CHECKPOINT 3] Database returned: ${results.length} chunks`);

    if (results.length < 2) {
      const sequentialFilter = {};
      if (targetWorkspaceId && mongoose.Types.ObjectId.isValid(targetWorkspaceId)) {
        sequentialFilter.workspace_id = new mongoose.Types.ObjectId(targetWorkspaceId);
      } else {
        sequentialFilter.userId = req.user._id;
      }
      results = await DocumentChunk.find(sequentialFilter)
        .sort({ _id: 1 })
        .limit(5)
        .lean();
    }

    const contextBlocks = results
      .map((chunk) => `[${chunk.text}] (Source: ${chunk.fileName || "Unknown"})`)
      .join("\n");

    console.log(`[CHECKPOINT 4] Context passed into system prompt:\n${contextBlocks}`);

    const systemPrompt = `You are the advanced document intelligence engine for NexusNode AI. Your task is to answer the user's prompt using only the provided semantic text context blocks. 

=== SEMANTIC CONTEXT BLOCKS ===
${contextBlocks}
===============================

CRITICAL OPERATIONAL RULES:
- Base your analysis strictly on the context blocks provided above. If the context does not contain relevant information, state that clearly.
- Maintain an authoritative, analytical, and highly precise technical tone.
- Do not make up facts or extrapolate beyond what is documented.
- Return output using cleanly formatted structural Markdown (bolding, headers, bullet points). Do not output loose unformatted structures.`;

    const previousMessages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).lean();

    const groqMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: queryText,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
    });

    const assistantResponseText = chatCompletion.choices[0]?.message?.content || "";

    const citations = results.map((chunk) => ({
      documentId: chunk.documentId ? chunk.documentId.toString() : chunk._id.toString(),
      fileName: chunk.fileName,
      textSnippet: chunk.text,
    }));

    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: queryText,
      citations: [],
    });

    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: assistantResponseText,
      citations,
    });

    if (documentIds && documentIds.length > 0) {
      const mergedIds = [
        ...new Set([
          ...conversation.documentIds.map((id) => id.toString()),
          ...documentIds.map((id) => id.toString()),
        ]),
      ];
      conversation.documentIds = mergedIds;
      conversation.markModified("documentIds");
    }
    await conversation.save();

    return res.status(200).json({
      conversationId: conversation._id,
      message: assistantMessage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to process chat message" });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { workspace_id, documentIds } = req.body;
    const workspaceId = (workspace_id && mongoose.Types.ObjectId.isValid(workspace_id))
      ? new mongoose.Types.ObjectId(workspace_id)
      : undefined;

    const conversation = await Conversation.create({
      userId: req.user._id,
      workspace_id: workspaceId,
      documentIds: documentIds || [],
    });

    return res.status(201).json({
      conversationId: conversation._id,
      conversation,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create conversation" });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    const { workspace_id } = req.query;
    if (workspace_id && mongoose.Types.ObjectId.isValid(workspace_id)) {
      filter.workspace_id = new mongoose.Types.ObjectId(workspace_id);
    }
    const conversations = await Conversation.find(filter).sort({ updatedAt: -1 });
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch conversations" });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch messages" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.deleteOne({ _id: conversation._id });
    return res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete conversation" });
  }
};

export const editChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const userMessage = await Message.findById(id);
    if (!userMessage || userMessage.role !== "user") {
      return res.status(404).json({ message: "User message not found" });
    }

    const conversation = await Conversation.findOne({
      _id: userMessage.conversationId,
      userId: req.user._id,
    });
    if (!conversation) {
      return res.status(403).json({ message: "Unauthorized access to conversation" });
    }

    let targetWorkspaceId = conversation.workspace_id ? conversation.workspace_id.toString() : undefined;
    if (!targetWorkspaceId && conversation.documentIds && conversation.documentIds.length > 0) {
      const doc = await Document.findById(conversation.documentIds[0]);
      if (doc && doc.workspace_id) {
        targetWorkspaceId = doc.workspace_id.toString();
      }
    }

    const queryVector = await getEmbedding(content);

    let results = [];
    if (targetWorkspaceId) {
      try {
        results = await DocumentChunk.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 100,
              limit: 5,
              filter: { workspace_id: new mongoose.Types.ObjectId(targetWorkspaceId) },
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              fileName: 1,
              metadata: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);
      } catch (vectorSearchError) {
        const allChunks = await DocumentChunk.find({
          workspace_id: new mongoose.Types.ObjectId(targetWorkspaceId),
        }).lean();
        results = scoreAndSortChunks(queryVector, allChunks, 5);
      }
    }

    if (results.length === 0) {
      try {
        results = await DocumentChunk.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 100,
              limit: 5,
              filter: { userId: req.user._id },
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              fileName: 1,
              metadata: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);
      } catch (vectorSearchError) {
        const allChunks = await DocumentChunk.find({ userId: req.user._id }).lean();
        results = scoreAndSortChunks(queryVector, allChunks, 5);
      }
    }

    if (results.length < 2) {
      const sequentialFilter = {};
      if (targetWorkspaceId && mongoose.Types.ObjectId.isValid(targetWorkspaceId)) {
        sequentialFilter.workspace_id = new mongoose.Types.ObjectId(targetWorkspaceId);
      } else {
        sequentialFilter.userId = req.user._id;
      }
      results = await DocumentChunk.find(sequentialFilter)
        .sort({ _id: 1 })
        .limit(5)
        .lean();
    }

    const contextBlocks = results
      .map((chunk) => `[${chunk.text}] (Source: ${chunk.fileName || "Unknown"})`)
      .join("\n");

    const systemPrompt = `You are the advanced document intelligence engine for NexusNode AI. Your task is to answer the user's prompt using only the provided semantic text context blocks. 

=== SEMANTIC CONTEXT BLOCKS ===
${contextBlocks}
===============================

CRITICAL OPERATIONAL RULES:
- Base your analysis strictly on the context blocks provided above. If the context does not contain relevant information, state that clearly.
- Maintain an authoritative, analytical, and highly precise technical tone.
- Do not make up facts or extrapolate beyond what is documented.
- Return output using cleanly formatted structural Markdown (bolding, headers, bullet points). Do not output loose unformatted structures.`;

    const previousMessages = await Message.find({
      conversationId: conversation._id,
      createdAt: { $lt: userMessage.createdAt }
    }).sort({ createdAt: 1 }).lean();

    const groqMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: content,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
    });

    const assistantResponseText = chatCompletion.choices[0]?.message?.content || "";

    const citations = results.map((chunk) => ({
      documentId: chunk.documentId ? chunk.documentId.toString() : chunk._id.toString(),
      fileName: chunk.fileName,
      textSnippet: chunk.text,
    }));

    const assistantMessage = await Message.findOne({
      conversationId: conversation._id,
      role: "assistant",
      createdAt: { $gte: userMessage.createdAt }
    }).sort({ createdAt: 1 });

    const now = new Date();
    userMessage.content = content;
    userMessage.isEdited = true;
    userMessage.createdAt = now;
    await userMessage.save();

    conversation.updatedAt = now;
    await conversation.save();

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
        role: "assistant",
        content: assistantResponseText,
        citations,
        createdAt: now,
      });
    }

    return res.status(200).json({
      userMessage,
      assistantMessage: updatedAssistantMessage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to edit chat message" });
  }
};
