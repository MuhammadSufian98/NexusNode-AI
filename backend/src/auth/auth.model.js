import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    pwd_hash: {
      type: String,
      required: true,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    clearance: {
      type: String,
      default: "Lvl 4",
      trim: true,
    },
    nodesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    customLlmConfig: {
      preferredProvider: {
        type: String,
        enum: ["openai", "gemini"],
        default: "openai",
      },
      openaiKey: {
        type: String,
        default: null,
      },
      geminiKey: {
        type: String,
        default: null,
      },
      useCustomKeys: {
        type: Boolean,
        default: false,
      },
    },
    generalPreferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
