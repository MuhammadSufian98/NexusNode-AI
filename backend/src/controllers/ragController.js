import { createRequire } from "module";
import mongoose from "mongoose";

const require = createRequire(import.meta.url);
const pdfBase = require("pdf-parse");
const pdf =
  typeof pdfBase === "function" ? pdfBase : pdfBase.default || pdfBase;

if (typeof pdf !== "function") {
  console.error("❌ ERROR: pdf-parse is still not a function.");
} else {
  console.log(
    `✅ Debug: pdf-parse successfully initialized as [${typeof pdf}]`,
  );
}

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Document from "../model/Documents.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    });
    return result.embedding.values;
  } catch (error) {
    console.error("❌ Gemini Embedding Error:", error.message);
    throw new Error("Failed to generate embedding.");
  }
}

export const uploadAndProcessPDF = async (req, res) => {
  console.log(`\n--- New Upload Request: ${req.file?.originalname} ---`);

  try {
    if (!req.file) {
      console.warn("⚠️ Upload failed: No file found in request.");
      return res.status(400).send("No file uploaded.");
    }

    console.log("📂 Parsing PDF...");
    const data = await pdf(req.file.buffer);
    console.log(`✅ PDF Parsed. Total characters: ${data.text.length}`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(data.text);
    console.log(`✂️ Text split into ${chunks.length} chunks.`);

    console.log("🤖 Generating embeddings in batches (Free Tier Optimized)...");

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const docsToSave = [];
    const batchSize = 100; // Gemini supports up to 100 items per batch call

    for (let i = 0; i < chunks.length; i += batchSize) {
      const currentBatch = chunks.slice(i, i + batchSize);

      console.log(
        `📡 Processing batch: ${i + 1} to ${Math.min(i + batchSize, chunks.length)}...`,
      );

      const batchResponse = await model.batchEmbedContents({
        requests: currentBatch.map((text) => ({
          content: { parts: [{ text }] },
          model: "models/gemini-embedding-001",
          outputDimensionality: 768,
        })),
      });

      const batchDocs = batchResponse.embeddings.map((emb, index) => ({
        text: currentBatch[index],
        embedding: emb.values,
        fileName: req.file.originalname,
      }));

      docsToSave.push(...batchDocs);

      // Brief pause to ensure we don't hit the 100 RPM limit if multiple files are uploaded quickly
      if (chunks.length > batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("💾 Saving to MongoDB Atlas...");
    await Document.insertMany(docsToSave);

    console.log("✨ Upload sequence complete!");
    res.json({ message: `Successfully indexed ${chunks.length} chunks.` });
  } catch (error) {
    console.error("❌ Critical Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const searchChunks = async (req, res) => {
  const { query, generateResponse = false } = req.body;

  try {
    if (!query) return res.status(400).send("Search query is required.");

    const dbName = mongoose.connection.name;
    const collectionName = Document.collection.name;

    console.log(`\n🔍 DB: ${dbName} | COLLECTION: ${collectionName}`);
    console.log(
      `--- Search Query: "${query}" (AI Response: ${generateResponse}) ---`,
    );

    console.log("🤖 Vectorizing query...");
    const queryVector = await getEmbedding(query);

    console.log("🔍 Querying Atlas Vector Search...");
    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 200,
          limit: 3,
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

    if (!generateResponse) {
      console.log(`✅ Found ${results.length} chunks.`);
      return res.json({ mode: "search", results });
    }

    console.log("🧠 Grounding Gemini with context...");
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

    console.log("✨ Gemini response generated successfully.");
    res.json({
      mode: "generate",
      answer: responseText,
      sources: [...new Set(results.map((r) => r.fileName))],
    });
  } catch (error) {
    console.error("❌ Search/Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// export const searchChunks = async (req, res) => {
//   console.log(`\n--- New Search Query: "${req.body.query}" ---`);

//   try {
//     const { query } = req.body;
//     if (!query) return res.status(400).send("Search query is required.");

//     console.log("🤖 Vectorizing query...");
//     const queryVector = await getEmbedding(query);

//     console.log("🔍 Querying Atlas Vector Search...");
//     const results = await Document.aggregate([
//       {
//         $vectorSearch: {
//           index: "vector_index",
//           path: "embedding",
//           queryVector: queryVector,
//           numCandidates: 100,
//           limit: 5,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           text: 1,
//           fileName: 1,
//           score: { $meta: "vectorSearchScore" },
//         },
//       },
//     ]);

//     console.log(`✅ Found ${results.length} relevant chunks.`);
//     res.json(results);
//   } catch (error) {
//     console.error("❌ Search Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
