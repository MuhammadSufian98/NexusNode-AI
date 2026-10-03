import { createRequire } from "module";
import { Readable } from "stream";
import mongoose from "mongoose";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";

import Document from "./documents.model.js";
import DocumentChunk from "./documentChunks.model.js";
import cloudinary from "../utils/cloudinary.js";
import { scoreAndSortChunks } from "../utils/vectorMath.js";
import { logger } from "../utils/logger.js";
import { getLocalEmbedding } from "../utils/localEmbedding.js";
import { renderPdfPageToJpeg } from "../utils/pdfPageRenderer.js";

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
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts text from a PDF buffer for a specified range of pages.
 * @param {Buffer} pdfBuffer
 * @param {number} startPage
 * @param {number} endPage
 * @returns {Promise<{ fullText: string, pages: Array<{pageNumber: number, text: string}>, totalPages: number }>}
 */
export const extractPdfPages = async (pdfBuffer, startPage = 1, endPage = Infinity) => {
  let totalDocPages = 0;
  const pageTexts = [];

  const pagerender = function (pageData) {
    const pageNum = pageData.pageNumber || (pageData.pageIndex !== undefined ? pageData.pageIndex + 1 : 1);
    if (pageNum > totalDocPages) {
      totalDocPages = pageNum;
    }

    if (pageNum >= startPage && pageNum <= endPage) {
      return pageData.getTextContent({ normalizeWhitespace: true }).then(function (textContent) {
        let lastY, text = "";
        for (const item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += "\n" + item.str;
          }
          lastY = item.transform[5];
        }
        pageTexts.push({ pageNumber: pageNum, text });
        return text;
      });
    }
    return Promise.resolve("");
  };

  const parsed = await pdf(pdfBuffer, { pagerender });
  const totalPages = parsed.numpages || totalDocPages || 1;

  // Sort collected pages in ascending order
  pageTexts.sort((a, b) => a.pageNumber - b.pageNumber);

  return {
    fullText: pageTexts.map((p) => p.text).filter(Boolean).join("\n\n"),
    pages: pageTexts,
    totalPages,
  };
};

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

    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return "0 KB";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const fileSizeNum = req.file.size || req.file.buffer?.length || 0;

    // 2. Create the document record with 'processing' status and explicit Cloudinary public ID
    const parentDoc = await Document.create({
      userId: req.user._id,
      workspace_id: workspaceId,
      fileName: req.file.originalname,
      name: req.file.originalname,
      pdfUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      publicId: cloudinaryResult.public_id,
      fileSize: fileSizeNum,
      size: formatBytes(fileSizeNum),
      pages: 1,
      totalPageCount: 1,
      indexedPageCount: 0,
      vectorTier: "100%",
      indexingProgress: 100,
      status: "processing",
    });

    // 3. Process the file contents inside a try...catch block
    try {
      let parsedData;
      try {
        parsedData = await extractPdfPages(req.file.buffer, 1, Infinity);
      } catch (parseError) {
        throw new Error("Failed to parse PDF. The file may be corrupted or invalid.");
      }

      const totalPages = parsedData.totalPages || 1;
      let textToIndex = "";
      let targetTier = "complete";
      let indexedPages = totalPages;
      let progress = 100;

      // Tiered Incremental Vectorization: If PDF exceeds 50 pages, extract and index first 25%
      if (totalPages > 50) {
        targetTier = "25%";
        indexedPages = Math.ceil(totalPages * 0.25);
        progress = 25;
        const initialSlice = parsedData.pages.filter((p) => p.pageNumber <= indexedPages);
        textToIndex = initialSlice.map((p) => p.text).filter(Boolean).join("\n\n");
      } else {
        textToIndex = parsedData.fullText;
      }

      if (!textToIndex || textToIndex.trim().length === 0) {
        throw new Error("Failed to extract readable text from the document pages.");
      }

      // Chunking: RecursiveCharacterTextSplitter with chunkSize: 1200, chunkOverlap: 200
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1200,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitText(textToIndex);

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

      // Update document status and tiered metrics
      parentDoc.status = "ready";
      parentDoc.chunkCount = chunks.length;
      parentDoc.pages = totalPages;
      parentDoc.totalPageCount = totalPages;
      parentDoc.indexedPageCount = indexedPages;
      parentDoc.vectorTier = targetTier;
      parentDoc.indexingProgress = progress;
      await parentDoc.save();

      return res.status(200).json({
        message: `Successfully indexed ${chunks.length} chunks (${targetTier} - ${indexedPages}/${totalPages} pages).`,
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

/**
 * Expands vector index tier for large documents (e.g. 25% -> 50% -> 75% -> complete).
 */
export const expandVectorTier = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!id) {
      return res.status(400).json({ message: "Document ID is required." });
    }

    const doc = await Document.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }, { id: id }].filter(Boolean),
      userId,
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (doc.status !== "ready") {
      return res.status(400).json({ message: "Document is not in ready status." });
    }

    const totalPages = doc.totalPageCount || doc.pages || 1;
    const currentIndexed = doc.indexedPageCount || 0;

    if (doc.vectorTier === "complete" || doc.vectorTier === "100%" || currentIndexed >= totalPages) {
      doc.vectorTier = "complete";
      doc.indexedPageCount = totalPages;
      doc.indexingProgress = 100;
      await doc.save();
      return res.status(200).json({
        message: "Document is already fully vectorized.",
        document: doc,
      });
    }

    // Determine next tier and target page range
    let nextTier = "complete";
    let targetProgress = 100;
    let targetPage = totalPages;

    if (doc.vectorTier === "25%") {
      nextTier = "50%";
      targetProgress = 50;
      targetPage = Math.ceil(totalPages * 0.5);
    } else if (doc.vectorTier === "50%") {
      nextTier = "75%";
      targetProgress = 75;
      targetPage = Math.ceil(totalPages * 0.75);
    } else if (doc.vectorTier === "75%") {
      nextTier = "complete";
      targetProgress = 100;
      targetPage = totalPages;
    }

    const startPage = currentIndexed + 1;
    const endPage = Math.min(targetPage, totalPages);

    if (startPage > endPage) {
      doc.vectorTier = "complete";
      doc.indexedPageCount = totalPages;
      doc.indexingProgress = 100;
      await doc.save();
      return res.status(200).json({
        message: "All pages are already indexed.",
        document: doc,
      });
    }

    // 1. Fetch PDF buffer from Cloudinary
    let publicId = doc.cloudinaryPublicId || doc.publicId;
    if (!publicId && doc.pdfUrl) {
      const match = doc.pdfUrl.match(/\/upload\/(?:v\d+\/)?([^\?]+)/);
      if (match && match[1]) {
        publicId = decodeURIComponent(match[1]);
      }
    }

    let downloadUrl = null;
    if (publicId) {
      downloadUrl = cloudinary.utils.private_download_url(publicId, "pdf", {
        resource_type: "raw",
        type: "upload",
        attachment: false,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });
    } else if (doc.pdfUrl) {
      downloadUrl = doc.pdfUrl;
    }

    if (!downloadUrl) {
      return res.status(400).json({ message: "No PDF asset ID or URL associated with this document." });
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return res.status(502).json({ message: "Failed to download PDF stream from storage for expansion." });
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 2. Extract only the incremental page slice [startPage, endPage]
    const parsedData = await extractPdfPages(pdfBuffer, startPage, endPage);
    const textToIndex = parsedData.fullText;

    if (!textToIndex || textToIndex.trim().length === 0) {
      doc.indexedPageCount = endPage;
      doc.vectorTier = endPage >= totalPages ? "complete" : nextTier;
      doc.indexingProgress = endPage >= totalPages ? 100 : targetProgress;
      await doc.save();
      return res.status(200).json({
        message: `Indexed up to page ${endPage} (no additional text found in this range).`,
        document: doc,
      });
    }

    // 3. Chunk and vectorize incremental slice
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1200,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(textToIndex);

    const docsToSave = [];
    for (const chunkText of chunks) {
      const embedding = await getLocalEmbedding(chunkText);
      docsToSave.push({
        documentId: doc._id,
        userId: req.user._id,
        workspace_id: doc.workspace_id,
        fileName: doc.fileName || doc.name,
        text: chunkText,
        embedding: embedding,
        metadata: {
          pageNumber: startPage,
        },
      });
    }

    if (docsToSave.length > 0) {
      await DocumentChunk.insertMany(docsToSave);
    }

    // 4. Update document metadata
    doc.chunkCount = (doc.chunkCount || 0) + docsToSave.length;
    doc.indexedPageCount = endPage;
    doc.vectorTier = endPage >= totalPages ? "complete" : nextTier;
    doc.indexingProgress = endPage >= totalPages ? 100 : targetProgress;
    await doc.save();

    return res.status(200).json({
      message: `Expanded index to ${doc.vectorTier} (${endPage}/${totalPages} pages, +${docsToSave.length} chunks).`,
      document: doc,
    });
  } catch (error) {
    logger.error("expand_vector_tier_failed", { error: error.message });
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

export const streamDocumentPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    // Explicit CORS headers to prevent browser "TypeError: Failed to fetch"
    const origin = req.headers.origin || "http://localhost:3000";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Range");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    let document = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      document = await Document.findOne({ _id: id, userId });
    }
    if (!document) {
      document = await Document.findOne({
        userId,
        $or: [{ fileName: id }, { cloudinaryPublicId: id }, { id: id }],
      });
    }

    if (!document) {
      return res.status(404).json({ message: "Document not found or unauthorized" });
    }

    let publicId = document.cloudinaryPublicId || document.publicId;

    if (!publicId && document.pdfUrl) {
      const match = document.pdfUrl.match(/\/upload\/(?:v\d+\/)?([^\?]+)/);
      if (match && match[1]) {
        publicId = decodeURIComponent(match[1]);
      }
    }

    let downloadUrl = null;

    if (publicId) {
      downloadUrl = cloudinary.utils.private_download_url(publicId, "pdf", {
        resource_type: "raw",
        type: "upload",
        attachment: false,
        expires_at: Math.floor(Date.now() / 1000) + 7200,
      });
    } else if (document.pdfUrl) {
      downloadUrl = document.pdfUrl;
    }

    if (!downloadUrl) {
      return res.status(400).json({ message: "No asset URL found for document" });
    }

    // Fetch upstream asset from Cloudinary
    const upstreamResponse = await fetch(downloadUrl, { redirect: "follow" });
    if (!upstreamResponse.ok) {
      console.error("[CLOUDINARY_FETCH_FAIL]:", upstreamResponse.status, upstreamResponse.statusText);
      return res.status(upstreamResponse.status).json({ message: "Upstream storage fetch failed" });
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify PDF Magic Bytes (%PDF)
    if (buffer.slice(0, 4).toString() !== "%PDF") {
      console.error("[INVALID_PDF]: First bytes:", buffer.slice(0, 50).toString());
      return res.status(502).json({ message: "Storage provider did not return valid PDF data" });
    }

    // Strict inline headers that satisfy browser CORS & disarm IDM
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(document.name || document.fileName || "document.pdf")}"`);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "private, no-transform, max-age=3600");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.status(200).end(buffer);
  } catch (error) {
    console.error("[STREAM_PDF_ERROR]:", error);
    if (!res.headersSent) {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      return res.status(500).json({ message: "Internal server error streaming document" });
    }
  }
};

// In-memory cache for recent PDF buffers to make page-flipping instantaneous
const bufferCache = new Map(); // key: docId, value: { buffer, timestamp }
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export const getDocumentPagePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const userId = req.user?._id || req.user?.id;

    let document = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      document = await Document.findOne({ _id: id, userId });
    }
    if (!document) {
      document = await Document.findOne({
        userId,
        $or: [{ fileName: id }, { cloudinaryPublicId: id }, { id: id }],
      });
    }

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    let pdfBuffer = null;
    const cacheKey = String(document._id || id);
    const cached = bufferCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      pdfBuffer = cached.buffer;
    } else {
      // Fetch binary from Cloudinary
      let publicId = document.cloudinaryPublicId || document.publicId;

      if (!publicId && document.pdfUrl) {
        const match = document.pdfUrl.match(/\/upload\/(?:v\d+\/)?([^\?]+)/);
        if (match && match[1]) {
          publicId = decodeURIComponent(match[1]);
        }
      }

      let downloadUrl = null;

      if (publicId) {
        downloadUrl = cloudinary.utils.private_download_url(publicId, "pdf", {
          resource_type: "raw",
          type: "upload",
          attachment: false,
          expires_at: Math.floor(Date.now() / 1000) + 7200,
        });
      } else if (document.pdfUrl) {
        downloadUrl = document.pdfUrl;
      }

      if (!downloadUrl) {
        return res.status(400).json({ message: "No PDF asset URL available" });
      }

      const response = await fetch(downloadUrl, { redirect: "follow" });
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch asset from storage" });
      }

      const arrayBuf = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuf);

      // Cache buffer
      bufferCache.set(cacheKey, { buffer: pdfBuffer, timestamp: Date.now() });
    }

    // Render requested page to JPEG
    const { imageBuffer, totalPages } = await renderPdfPageToJpeg(pdfBuffer, page, 2.0);

    // Stream JPEG directly
    const origin = req.headers.origin || "http://localhost:3000";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Headers", "X-Total-Pages");
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", imageBuffer.length);
    res.setHeader("X-Total-Pages", String(totalPages));
    res.setHeader("Cache-Control", "private, no-transform, max-age=3600");

    return res.status(200).end(imageBuffer);
  } catch (error) {
    console.error("[NATIVE_PAGE_RENDER_ERROR]:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to render document page" });
    }
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
