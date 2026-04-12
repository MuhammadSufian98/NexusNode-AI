import User from "../auth/auth.model.js";
import nodemailer from "nodemailer";
import TempCode from "../auth/tempCode.model.js";
import { logger } from "../utils/logger.js";

const SIX_DIGIT_CODE_MIN = 100000;
const SIX_DIGIT_CODE_MAX = 999999;
const OTP_TTL_MS = 5 * 60 * 1000;

const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const normalizeEmail = (value = "") => value.trim().toLowerCase();

const isEmailLike = (value = "") => /^\S+@\S+\.\S+$/.test(value);

const maskEmail = (email = "") => {
  const [localPart, domain = ""] = email.split("@");
  if (!localPart || !domain) return "unknown";
  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
};

const avatarToDataUrl = (avatar = null) => {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  if (!avatar.data || !avatar.contentType) return "";
  return `data:${avatar.contentType};base64,${avatar.data}`;
};

const publicUser = (user, options = {}) => {
  const includeAvatar = options.includeAvatar === true;
  const avatarData = includeAvatar ? avatarToDataUrl(user.avatar) : "";

  return {
  id: String(user._id),
  email: user.email,
  full_name: user.full_name,
  isVerified: Boolean(user.isVerified),
  avatar: avatarData,
  avatarUrl: avatarData,
  clearance: user.clearance || "Lvl 4",
  nodesCount: Number(user.nodesCount || 0),
  };
};

const sendVerificationCode = async (email, contextLabel = "PROFILE_EMAIL_CHANGE") => {
  const otpCode = String(
    Math.floor(
      Math.random() * (SIX_DIGIT_CODE_MAX - SIX_DIGIT_CODE_MIN + 1) +
        SIX_DIGIT_CODE_MIN,
    ),
  );

  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await TempCode.findOneAndUpdate(
    { email },
    { email, code: otpCode, expiresAt },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

  await mailTransporter.sendMail({
    from: `"NexusNode AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify your new NexusNode AI email",
    text: `Your NexusNode AI verification code is ${otpCode}. It expires in 5 minutes.`,
  });

  logger.info("profile_verification_code_generated", {
    context: contextLabel,
    email: maskEmail(email),
  });
};

export const getProfile = async (req, res) => {
  try {
    const includeAvatar = String(req.query?.includeAvatar || "") === "1";
    const projection = includeAvatar
      ? "_id email full_name isVerified avatar clearance nodesCount"
      : "_id email full_name isVerified clearance nodesCount";

    const startedAt = Date.now();
    const user = await User.findById(req.user._id).select(projection);

    if (!user) {
      logger.warn("profile_get_unauthorized", {
        requestId: req.id,
        userId: String(req.user?._id || ""),
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const responsePayload = publicUser(user, { includeAvatar });
    const responseBytes = Buffer.byteLength(JSON.stringify(responsePayload), "utf8");

    logger.info("profile_get_success", {
      requestId: req.id,
      userId: String(user._id),
      includeAvatar,
      responseBytes,
      durationMs: Date.now() - startedAt,
    });

    return res.status(200).json(responsePayload);
  } catch (error) {
    logger.error("profile_get_failed", {
      requestId: req.id,
      userId: String(req.user?._id || ""),
      error: error.message,
    });
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const full_name = (req.body?.full_name || "").trim();
    const nextEmailRaw = req.body?.email;
    const hasNameUpdate = typeof req.body?.full_name === "string";
    const hasEmailUpdate = typeof nextEmailRaw === "string";

    if (!hasNameUpdate && !hasEmailUpdate) {
      return res
        .status(400)
        .json({ message: "At least one field is required to update profile" });
    }

    const updateDoc = {};
    let emailChanged = false;

    if (hasNameUpdate) {
      if (!full_name || full_name.length < 2 || full_name.length > 120) {
        return res.status(400).json({
          message: "full_name must be between 2 and 120 characters",
        });
      }
      updateDoc.full_name = full_name;
    }

    if (hasEmailUpdate) {
      const nextEmail = normalizeEmail(nextEmailRaw);
      if (!nextEmail || !isEmailLike(nextEmail)) {
        return res.status(400).json({ message: "Valid email is required" });
      }

      if (nextEmail !== req.user.email) {
        const duplicate = await User.findOne({
          email: nextEmail,
          _id: { $ne: req.user._id },
        }).select("_id");

        if (duplicate) {
          return res.status(409).json({ message: "Email already in use" });
        }

        updateDoc.email = nextEmail;
        updateDoc.isVerified = false;
        emailChanged = true;
      }
    }

    if (!Object.keys(updateDoc).length) {
      const current = await User.findById(req.user._id).select(
        "_id email full_name isVerified avatar clearance nodesCount",
      );
      return res.status(200).json({
        message: "Profile unchanged",
        user: publicUser(current),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateDoc, {
      runValidators: true,
      returnDocument: "after",
    }).select("_id email full_name isVerified avatar clearance nodesCount");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (emailChanged) {
      await sendVerificationCode(updatedUser.email);
      logger.info("profile_email_changed", {
        requestId: req.id,
        userId: String(updatedUser._id),
        nextEmail: maskEmail(updatedUser.email),
      });
    } else {
      logger.info("profile_updated", {
        requestId: req.id,
        userId: String(updatedUser._id),
      });
    }

    return res.status(200).json({
      message: emailChanged
        ? "Profile updated. Verification code sent to new email"
        : "Profile updated",
      emailVerificationRequired: emailChanged,
      user: publicUser(updatedUser),
    });
  } catch (error) {
    logger.error("profile_update_failed", {
      requestId: req.id,
      userId: String(req.user?._id || ""),
      error: error.message,
    });
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const contentType = req.file.mimetype || "image/png";
    const allowedContentTypes = new Set([
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ]);

    if (!allowedContentTypes.has(contentType)) {
      return res.status(400).json({
        message: "Unsupported avatar type. Use PNG, JPG, JPEG, or WEBP",
      });
    }

    const avatarPayload = {
      data: req.file.buffer.toString("base64"),
      contentType,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPayload },
      {
        runValidators: true,
        returnDocument: "after",
      },
    ).select("_id email full_name isVerified avatar clearance nodesCount");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("profile_avatar_updated", {
      requestId: req.id,
      userId: String(updatedUser._id),
      avatarBytes: Buffer.byteLength(updatedUser?.avatar?.data || "", "utf8"),
    });

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      user: publicUser(updatedUser),
    });
  } catch (error) {
    logger.error("profile_avatar_upload_failed", {
      requestId: req.id,
      userId: String(req.user?._id || ""),
      error: error.message,
    });
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};
