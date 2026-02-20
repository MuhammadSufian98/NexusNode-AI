import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  // This must match the 'path' you set in your Atlas Vector Search Index
  embedding: {
    type: [Number],
    required: true,
  },
  metadata: {
    pageNumber: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

// Export the model
const Document = mongoose.model("Document", documentSchema);
export default Document;
