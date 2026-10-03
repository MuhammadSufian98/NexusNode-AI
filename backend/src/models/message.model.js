import mongoose from "mongoose";

const citationSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    fileName: {
      type: String,
    },
    documentName: {
      type: String,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    textSnippet: {
      type: String,
    },
    snippet: {
      type: String,
    },
    similarityScore: {
      type: Number,
      default: 0.85,
    },
    score: {
      type: Number,
      default: 0.85,
    },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
