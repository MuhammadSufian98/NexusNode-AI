export const cosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new Error("Vectors must be arrays");
  }
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = Number(vecA[i]);
    const b = Number(vecB[i]);
    if (isNaN(a) || isNaN(b)) {
      throw new Error("Vector elements must be valid numbers");
    }
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const scoreAndSortChunks = (queryVector, chunks, limit = 5) => {
  if (!Array.isArray(queryVector)) {
    throw new Error("Query vector must be an array");
  }
  if (!Array.isArray(chunks)) {
    throw new Error("Chunks must be an array");
  }
  const scored = [];
  for (const chunk of chunks) {
    if (!chunk || !Array.isArray(chunk.embedding)) {
      continue;
    }
    try {
      const score = cosineSimilarity(queryVector, chunk.embedding);
      scored.push({
        _id: chunk._id,
        text: chunk.text,
        fileName: chunk.fileName,
        metadata: chunk.metadata,
        score,
      });
    } catch (err) {
      continue;
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};
