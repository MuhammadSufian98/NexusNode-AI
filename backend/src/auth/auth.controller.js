import bcrypt from "bcrypt";
import fs from "node:fs/promises";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "node:path";

import User from "./auth.model.js";
import TempCode from "./tempCode.model.js";

const SIX_DIGIT_CODE_MIN = 100000;
const SIX_DIGIT_CODE_MAX = 999999;
const OTP_TTL_MS = 5 * 60 * 1000;
const APP_ENV = (
  process.env.APP_ENV ||
  process.env.NODE_ENV ||
  "development"
).toLowerCase();
const IS_PRODUCTION = APP_ENV === "production";

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const signToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const normalizeEmail = (value = "") => value.trim().toLowerCase();

const isEmailLike = (value = "") => /^\S+@\S+\.\S+$/.test(value);

const maskEmail = (email = "") => {
  const [localPart, domain = ""] = email.split("@");
  if (!localPart || !domain) return "unknown";
  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
};

const sanitizeFileName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const publicUser = (user) => ({
  id: String(user._id),
  email: user.email,
  full_name: user.full_name,
  isVerified: Boolean(user.isVerified),
  avatar: user.avatar || "",
  clearance: user.clearance || "Lvl 4",
  nodesCount: Number(user.nodesCount || 0),
});

const sendVerificationCode = async (email, contextLabel = "VERIFY_EMAIL") => {
  const otpCode = String(
    Math.floor(
      Math.random() * (SIX_DIGIT_CODE_MAX - SIX_DIGIT_CODE_MIN + 1) +
        SIX_DIGIT_CODE_MIN,
    ),
  );

  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  console.log(
    `[AUTH][${contextLabel}] OTP request received for ${maskEmail(email)} | collection=${TempCode.collection.name}`,
  );

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
    from: process.env.GMAIL_USER,
    to: email,
    subject: "NexusNode AI - Email Verification Code",
    text: `Your verification code is ${otpCode}. It expires in 5 minutes.`,
  });
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id email full_name");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !isEmailLike(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    await sendVerificationCode(email, "VERIFY_EMAIL");

    return res.status(200).json({
      message: "Verification code sent to email",
      expires_in_seconds: 300,
    });
  } catch (error) {
    console.error("[AUTH][VERIFY_EMAIL] Failed:", error.message);
    return res.status(500).json({ message: "Failed to send verification code" });
  }
};

export const register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";
    const full_name = (req.body?.full_name || "").trim();
    const code = String(req.body?.code || "").trim();

    if (!email || !isEmailLike(email) || !password || !full_name || !code) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      console.warn(
        `[AUTH][REGISTER] Duplicate email blocked for ${maskEmail(email)} | collection=${User.collection.name}`,
      );
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = await TempCode.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      console.warn(
        `[AUTH][REGISTER] Invalid/expired OTP for ${maskEmail(email)} | collection=${TempCode.collection.name}`,
      );
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    const pwd_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      full_name,
      pwd_hash,
      isVerified: true,
    });

    console.log(
      `[AUTH][REGISTER] User created id=${user._id} email=${maskEmail(email)} | collection=${User.collection.name}`,
    );

    await TempCode.deleteMany({ email });
    console.log(
      `[AUTH][REGISTER] Consumed OTP removed for ${maskEmail(email)} | collection=${TempCode.collection.name}`,
    );

    return res.status(201).json({
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("[AUTH][REGISTER] Failed:", error.message);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("_id email full_name pwd_hash");
    if (!user) {
      console.warn(
        `[AUTH][LOGIN] User not found for ${maskEmail(email)} | collection=${User.collection.name}`,
      );
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(password, user.pwd_hash);
    if (!passwordOk) {
      console.warn(`[AUTH][LOGIN] Invalid password for ${maskEmail(email)}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(
      `[AUTH][LOGIN] Login success id=${user._id} email=${maskEmail(email)} | cookie=token`,
    );

    return res.status(200).json({
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("[AUTH][LOGIN] Failed:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const me = async (req, res) => {
  console.log(
    `[AUTH][ME] Session validated id=${req.user._id} email=${maskEmail(req.user.email)}`,
  );
  const user = await User.findById(req.user._id).select(
    "_id email full_name isVerified avatar clearance nodesCount",
  );
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.status(200).json(publicUser(user));
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
  });
  console.log("[AUTH][LOGOUT] Session cookie cleared");
  return res.status(200).json({ message: "Logout successful" });
};

export const profile = async (req, res) => {
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
      await sendVerificationCode(updatedUser.email, "PROFILE_EMAIL_CHANGE");
      console.log(
        `[AUTH][PROFILE] Email changed for id=${updatedUser._id} -> ${maskEmail(updatedUser.email)}; verification reset`,
      );
    } else {
      console.log(`[AUTH][PROFILE] Profile updated for id=${updatedUser._id}`);
    }

    return res.status(200).json({
      message: emailChanged
        ? "Profile updated. Verification code sent to new email"
        : "Profile updated",
      emailVerificationRequired: emailChanged,
      user: publicUser(updatedUser),
    });
  } catch (error) {
    console.error("[AUTH][PROFILE] Failed:", error.message);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const avatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const ext = path.extname(req.file.originalname || "").toLowerCase();
    const allowedExt = new Set([".png", ".jpg", ".jpeg", ".webp"]);
    const safeExt = allowedExt.has(ext) ? ext : ".png";
    const originalBaseName = path.basename(
      req.file.originalname || "avatar",
      ext,
    );
    const safeBaseName = sanitizeFileName(originalBaseName) || "avatar";

    const fileName = `${req.user._id}-${Date.now()}-${safeBaseName}${safeExt}`;
    const avatarsDir = path.join(process.cwd(), "uploads", "avatars");

    await fs.mkdir(avatarsDir, { recursive: true });
    await fs.writeFile(path.join(avatarsDir, fileName), req.file.buffer);

    const backendPublicBase = (
      process.env.BACKEND_PUBLIC_URL ||
      `http://localhost:${process.env.PORT || 5000}`
    ).replace(/\/$/, "");

    const avatarUrl = `${backendPublicBase}/uploads/avatars/${fileName}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      {
        runValidators: true,
        returnDocument: "after",
      },
    ).select("_id email full_name isVerified avatar clearance nodesCount");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      `[AUTH][AVATAR] Avatar updated for id=${updatedUser._id} file=${fileName}`,
    );

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      user: publicUser(updatedUser),
    });
  } catch (error) {
    console.error("[AUTH][AVATAR] Failed:", error.message);
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};
