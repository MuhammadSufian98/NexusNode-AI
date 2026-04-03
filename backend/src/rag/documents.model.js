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

const Document = mongoose.model("Document", documentSchema);
export default Document;
