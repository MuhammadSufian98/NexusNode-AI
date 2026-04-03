import mongoose from "mongoose";

const tempCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 300,
    },
  },
  { timestamps: true },
);

const TempCode = mongoose.model("TempCode", tempCodeSchema);

export default TempCode;
