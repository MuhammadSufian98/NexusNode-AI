import { pipeline } from "@xenova/transformers";

class LocalEmbeddingPipeline {
  static instance = null;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return this.instance;
  }
}

/**
 * Generates a 384-dimensional vector embedding for the given text.
 * Mean pooling and L2 normalization are performed automatically by the pipeline options.
 * @param {string} text The input text to embed.
 * @returns {Promise<number[]>} A promise that resolves to the 384-dimensional embedding array.
 */
export async function getLocalEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Input text must be a non-empty string.");
  }
  
  try {
    const extractor = await LocalEmbeddingPipeline.getInstance();
    const result = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    
    // Convert Float32Array tensor data to standard JS Array of numbers
    return Array.from(result.data);
  } catch (error) {
    console.error("Local embedding generation failed:", error);
    throw new Error(`Failed to generate local embedding: ${error.message}`);
  }
}
