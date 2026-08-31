import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workspace_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat Session",
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
