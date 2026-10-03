import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    fileName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    pages: {
      type: Number,
      default: 1,
    },
    size: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    totalPageCount: {
      type: Number,
      default: 1,
    },
    indexedPageCount: {
      type: Number,
      default: 0,
    },
    vectorTier: {
      type: String,
      enum: ["25%", "50%", "75%", "100%", "complete"],
      default: "100%",
    },
    indexingProgress: {
      type: Number,
      default: 100,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
