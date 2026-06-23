import "dotenv/config";
import mongoose from "mongoose";
import Document from "../src/rag/documents.model.js";
import DocumentChunk from "../src/rag/documentChunks.model.js";

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "NexusNode";

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });

  const docs = await Document.find({}).lean();
  console.log("DOCS in DB:");
  for (const doc of docs) {
    console.log(`Document ID: ${doc._id}, name: ${doc.fileName}, workspace_id: ${doc.workspace_id}, userId: ${doc.userId}`);
  }

  const chunksCount = await DocumentChunk.countDocuments({});
  console.log("TOTAL CHUNKS IN DB:", chunksCount);

  if (chunksCount > 0) {
    const chunkSample = await DocumentChunk.findOne({}).lean();
    delete chunkSample.embedding;
    console.log("CHUNK SAMPLE (without embedding):", JSON.stringify(chunkSample, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
