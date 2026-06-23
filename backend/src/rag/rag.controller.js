import { createRequire } from "module";
import mongoose from "mongoose";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";

import Document from "./documents.model.js";
import DocumentChunk from "./documentChunks.model.js";
import cloudinary from "../utils/cloudinary.js";
import { scoreAndSortChunks } from "../utils/vectorMath.js";
import { logger } from "../utils/logger.js";

const require = createRequire(import.meta.url);
const pdfBase = require("pdf-parse");
const pdf = typeof pdfBase === "function" ? pdfBase : pdfBase.default || pdfBase;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const uploadPDFToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "nexusnode_documents",
        resource_type: "raw",
        public_id: originalName,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    });
    return result.embedding.values;
  } catch (error) {
    logger.error("rag_embedding_failed", { error: error.message });
    throw new Error("Failed to generate embedding.");
  }
}

export const uploadAndProcessPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { workspace_id } = req.body;
    const workspaceId = (workspace_id && mongoose.Types.ObjectId.isValid(workspace_id))
      ? new mongoose.Types.ObjectId(workspace_id)
      : undefined;

    const data = await pdf(req.file.buffer);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(data.text);

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const docsToSave = [];
    const batchSize = 100;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const currentBatch = chunks.slice(i, i + batchSize);

      const batchResponse = await model.batchEmbedContents({
        requests: currentBatch.map((text) => ({
          content: { parts: [{ text }] },
          model: "models/gemini-embedding-001",
          outputDimensionality: 768,
        })),
      });

      const batchDocs = batchResponse.embeddings.map((emb, idx) => ({
        documentId: null,
        userId: req.user._id,
        workspace_id: workspaceId,
        fileName: req.file.originalname,
        text: currentBatch[idx],
        embedding: emb.values,
        metadata: {
          pageNumber: 1,
        },
      }));

      docsToSave.push(...batchDocs);

      if (chunks.length > batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const cloudinaryResult = await uploadPDFToCloudinary(req.file.buffer, req.file.originalname);

    const parentDoc = await Document.create({
      userId: req.user._id,
      workspace_id: workspaceId,
      fileName: req.file.originalname,
      pdfUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
    });

    for (const chunk of docsToSave) {
      chunk.documentId = parentDoc._id;
    }

    await DocumentChunk.insertMany(docsToSave);

    res.json({
      message: `Successfully indexed ${chunks.length} chunks.`,
      document: parentDoc,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user._id }).sort({ uploadedAt: -1 });
    return res.status(200).json(docs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ _id: id, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { resource_type: "raw" });
      } catch (cloudinaryErr) {
        logger.error("cloudinary_pdf_delete_failed", { error: cloudinaryErr.message });
      }
    }

    await DocumentChunk.deleteMany({ documentId: doc._id, userId: req.user._id });
    await Document.deleteOne({ _id: doc._id });

    return res.status(200).json({ message: "Document and its chunks deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const searchChunks = async (req, res) => {
  const { query, generateResponse = false } = req.body;

  try {
    if (!query) {
      return res.status(400).send("Search query is required.");
    }

    const dbName = mongoose.connection.name;
    const collectionName = DocumentChunk.collection.name;

    logger.info("rag_search_context", { dbName, collectionName });

    const queryVector = await getEmbedding(query);

    let results = [];
    try {
      results = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 200,
            limit: 3,
            filter: { userId: req.user._id },
          },
        },
        {
          $project: {
            _id: 1,
            text: 1,
            fileName: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);
    } catch (vectorSearchError) {
      const allChunks = await DocumentChunk.find({ userId: req.user._id }).lean();
      results = scoreAndSortChunks(queryVector, allChunks, 3);
    }

    if (!generateResponse) {
      return res.json({ mode: "search", results });
    }

    const contextText = results.map((doc) => doc.text).join("\n\n");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a helpful assistant for the NexusNode AI system.
Use the following pieces of retrieved context to answer the user's question.
If you don't know the answer based on the context, just say you don't know.

CONTEXT:
${contextText}

USER QUESTION:
${query}

ANSWER:
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      mode: "generate",
      answer: responseText,
      sources: [...new Set(results.map((r) => r.fileName))],
    });
  } catch (error) {
    logger.error("rag_search_failed", {
      error: error.message,
      query: query || "",
    });
    res.status(500).json({ error: error.message });
  }
};
