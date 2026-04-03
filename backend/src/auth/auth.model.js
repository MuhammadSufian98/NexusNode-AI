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
      trim: true,
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
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
