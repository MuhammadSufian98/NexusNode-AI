import DocumentTree from "../models/DocumentTree.js";
import DocumentChunk from "../rag/documentChunks.model.js";
import Document from "../rag/documents.model.js";
import groq from "../utils/groq.js";
import { logger } from "../utils/logger.js";

export const buildSingleDocumentTree = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const existingTree = await DocumentTree.findOne({ userId, documentId });
    if (existingTree) {
      return res.status(200).json(existingTree);
    }

    const document = await Document.findOne({ _id: documentId, userId });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const chunks = await DocumentChunk.find({ documentId, userId })
      .select("text")
      .lean();

    if (!chunks || chunks.length === 0) {
      return res.status(400).json({ message: "No chunks found for this document" });
    }

    const outlineFragments = chunks
      .map((chunk) => chunk.text.substring(0, 150))
      .join("\n---\n");

    const prompt = `Analyze the structural outline fragments of this document. Construct a 3-tiered hierarchical knowledge tree in valid JSON format.
The structure MUST strictly follow this exact shape:
{
  "name": "Document Root Title",
  "children": [
    {
      "name": "Core Pillar Point",
      "description": "A precise 2-line explanation summarizing this core concept.",
      "children": [
        { 
          "name": "Sub-Detail Feature", 
          "description": "A precise 2-line explanation detailing this secondary branch feature." 
        }
      ]
    }
  ]
}

Outline fragments:
${outlineFragments}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const treeData = JSON.parse(responseText);

    const newTree = await DocumentTree.create({
      userId,
      documentId,
      treeData,
      isGenerated: true,
    });

    return res.status(201).json(newTree);
  } catch (error) {
    logger.error("tree_controller_single_build_failed", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: error.message });
  }
};

export const buildGlobalMasterTree = async (req, res) => {
  try {
    const userId = req.user._id;

    const existingMaster = await DocumentTree.findOne({ userId, documentId: null });
    if (existingMaster) {
      return res.status(200).json(existingMaster);
    }

    const subTrees = await DocumentTree.find({
      userId,
      documentId: { $ne: null },
    }).lean();

    if (!subTrees || subTrees.length === 0) {
      return res.status(400).json({ message: "No single document trees found to synthesize global tree" });
    }

    const outlineSummary = subTrees
      .map((tree) => {
        const title = tree.treeData?.name || "Untitled Document";
        const pillars = (tree.treeData?.children || []).map((child) => child.name);
        return `Document Title: ${title}\nCore Pillars: ${pillars.join(", ")}`;
      })
      .join("\n\n");

    const prompt = `Analyze these high-level document outlines (titles and core pillars) from the user's library.
Construct a master cross-document connection tree in valid JSON format finding thematic overlaps and connecting concepts across these documents.
The structure MUST strictly follow this exact shape:
{
  "name": "Global Connection Master Title",
  "children": [
    {
      "name": "Thematic Overlap Theme",
      "description": "A precise 2-line explanation summarizing this core concept or shared theme.",
      "children": [
        { 
          "name": "Connecting Detail or Sub-Theme", 
          "description": "A precise 2-line explanation detailing this secondary branch feature and how documents relate to it." 
        }
      ]
    }
  ]
}

Document Outlines:
${outlineSummary}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const treeData = JSON.parse(responseText);

    const masterTree = await DocumentTree.create({
      userId,
      documentId: null,
      treeData,
      isGenerated: true,
    });

    return res.status(201).json(masterTree);
  } catch (error) {
    logger.error("tree_controller_global_build_failed", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: error.message });
  }
};

export const getGeneratedTreeIds = async (req, res) => {
  try {
    const userId = req.user._id;
    const trees = await DocumentTree.find({ userId, documentId: { $ne: null } })
      .select("documentId")
      .lean();
    const documentIds = trees.map((t) => t.documentId);
    return res.status(200).json(documentIds);
  } catch (error) {
    logger.error("tree_controller_get_ids_failed", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: error.message });
  }
};
