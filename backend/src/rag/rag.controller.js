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

import { getLocalEmbedding } from "../utils/localEmbedding.js";

export async function getEmbedding(text) {
  try {
    return await getLocalEmbedding(text);
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

    // 1. Upload to Cloudinary first to get required fields for parent document
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadPDFToCloudinary(req.file.buffer, req.file.originalname);
    } catch (uploadError) {
      logger.error("cloudinary_upload_failed", { error: uploadError.message });
      return res.status(500).json({ error: "Failed to upload file to Cloudinary storage." });
    }

    // 2. Create the document record with 'processing' status
    const parentDoc = await Document.create({
      userId: req.user._id,
      workspace_id: workspaceId,
      fileName: req.file.originalname,
      pdfUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      status: "processing",
    });

    // 3. Process the file contents inside a try...catch block
    try {
      let data;
      try {
        data = await pdf(req.file.buffer);
      } catch (parseError) {
        throw new Error("Failed to parse PDF. The file may be corrupted or invalid.");
      }

      if (!data.text || data.text.trim().length === 0) {
        throw new Error("Failed to extract any text from the PDF.");
      }

      // Chunking: RecursiveCharacterTextSplitter with chunkSize: 1200, chunkOverlap: 200
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1200,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitText(data.text);

      if (chunks.length === 0) {
        throw new Error("No text chunks could be generated from the PDF text.");
      }

      // Local vector generation using getLocalEmbedding
      const docsToSave = [];
      for (const chunkText of chunks) {
        const embedding = await getLocalEmbedding(chunkText);
        docsToSave.push({
          documentId: parentDoc._id,
          userId: req.user._id,
          workspace_id: workspaceId,
          fileName: req.file.originalname,
          text: chunkText,
          embedding: embedding,
          metadata: {
            pageNumber: 1,
          },
        });
      }

      // Bulk-insert DocumentChunk records
      await DocumentChunk.insertMany(docsToSave);

      // Update document status to 'ready'
      parentDoc.status = "ready";
      parentDoc.chunkCount = chunks.length;
      await parentDoc.save();

      return res.status(200).json({
        message: `Successfully indexed ${chunks.length} chunks.`,
        document: parentDoc,
      });

    } catch (processingError) {
      logger.error("pdf_processing_failed", { error: processingError.message, documentId: parentDoc._id });
      
      // Update document status to 'failed' and save errorMessage
      parentDoc.status = "failed";
      parentDoc.errorMessage = processingError.message;
      await parentDoc.save();

      // Return HTTP 200 with the failed status object so client can handle warning state immediately
      return res.status(200).json({
        message: "Document processing failed.",
        document: parentDoc,
      });
    }

  } catch (error) {
    logger.error("upload_and_process_pdf_root_failed", { error: error.message });
    return res.status(500).json({ error: error.message });
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
