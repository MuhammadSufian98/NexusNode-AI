import mongoose from "mongoose";

const documentTreeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    treeData: {
      type: Object,
      required: true,
    },
    isGenerated: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const DocumentTree = mongoose.model("DocumentTree", documentTreeSchema);
export default DocumentTree;
