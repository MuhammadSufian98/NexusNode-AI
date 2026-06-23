import "dotenv/config";
import mongoose from "mongoose";
import Document from "../src/rag/documents.model.js";
import DocumentChunk from "../src/rag/documentChunks.model.js";
import { getEmbedding } from "../src/rag/rag.controller.js";
import { scoreAndSortChunks } from "../src/utils/vectorMath.js";

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "NexusNode";

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });

  const mockQuery = "NexusNode";
  const mockWorkspaceId = "67ee8a4d1b27f8326d8f0abc";

  console.log("Starting verification...");

  const queryVector = await getEmbedding(mockQuery);
  console.log(`[CHECKPOINT 1] Query text: "${mockQuery}", Embedding generated: ${Array.isArray(queryVector)}, Dimension: ${queryVector?.length}`);

  console.log(`[CHECKPOINT 2] Mock workspace_id: "${mockWorkspaceId}"`);
  const existCount = await DocumentChunk.countDocuments({ workspace_id: new mongoose.Types.ObjectId(mockWorkspaceId) });
  console.log(`[CHECKPOINT 2] Database check: found ${existCount} chunks matching workspace_id`);

  let results = [];
  try {
    results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 5,
          filter: { workspace_id: new mongoose.Types.ObjectId(mockWorkspaceId) },
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
  } catch (error) {
    const allChunks = await DocumentChunk.find({
      workspace_id: new mongoose.Types.ObjectId(mockWorkspaceId),
    }).lean();
    results = scoreAndSortChunks(queryVector, allChunks, 5);
  }

  console.log(`[CHECKPOINT 3] DB retrieval aggregation filter: { workspace_id: "${mockWorkspaceId}" }`);
  console.log(`[CHECKPOINT 3] Database returned: ${results.length} chunks`);

  if (results.length < 2) {
    const lexicalFilter = {
      workspace_id: new mongoose.Types.ObjectId(mockWorkspaceId),
      $or: [
        { text: { $regex: mockQuery, $options: "i" } },
        { fileName: { $regex: mockQuery, $options: "i" } }
      ]
    };
    results = await DocumentChunk.find(lexicalFilter).limit(5).lean();
    console.log(`[FALLBACK LEXICAL] Lexical search returned: ${results.length} chunks`);
  }

  const contextBlocks = results
    .map((chunk) => `[${chunk.text}] (Source: ${chunk.fileName || "Unknown"})`)
    .join("\n");

  console.log(`[CHECKPOINT 4] Context passed into system prompt:\n${contextBlocks}`);

  const citations = results.map((chunk) => ({
    documentId: chunk.documentId ? chunk.documentId.toString() : chunk._id.toString(),
    fileName: chunk.fileName,
    textSnippet: chunk.text,
  }));
  console.log("[CITATIONS OUTPUT]", JSON.stringify(citations, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
