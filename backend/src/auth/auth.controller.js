import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "./auth.model.js";
import TempCode from "./tempCode.model.js";
import { logger } from "../utils/logger.js";

const SIX_DIGIT_CODE_MIN = 100000;
const SIX_DIGIT_CODE_MAX = 999999;
const OTP_TTL_MS = 5 * 60 * 1000;
const APP_ENV = (process.env.APP_ENV || "development").toLowerCase();
const IS_PRODUCTION = APP_ENV === "production";

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

const avatarToDataUrl = (avatar = null) => {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  if (!avatar.data || !avatar.contentType) return "";
  return `data:${avatar.contentType};base64,${avatar.data}`;
};

const publicUser = (user) => ({
  id: String(user._id),
  email: user.email,
  full_name: user.full_name,
  isVerified: Boolean(user.isVerified),
  avatar: avatarToDataUrl(user.avatar),
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

  logger.info("auth_otp_requested", {
    context: contextLabel,
    email: maskEmail(email),
    collection: TempCode.collection.name,
  });

  await TempCode.findOneAndUpdate(
    { email },
    { email, code: otpCode, expiresAt },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

  logger.info("auth_smtp_handshake_start", {
    context: contextLabel,
    email: maskEmail(email),
  });

  try {
    await mailTransporter.sendMail({
      from: `"NexusNode AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔐 Secure Access: Your Neural Verification Code",
      text: `Your NexusNode AI verification code is ${otpCode}. It expires in 5 minutes.`,
      html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
              
              <div style="background: linear-gradient(135deg, #e11d48 0%, #f97316 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px;">NexusNode<span style="opacity: 0.8;">AI</span></h1>
              </div>

              <div style="padding: 40px; text-align: center;">
                <div style="background-color: #fff1f2; color: #e11d48; display: inline-block; padding: 8px 16px; border-radius: 99px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
                  Security Protocol Active
                </div>
                
                <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #0f172a;">Verify Your Identity</h2>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 30px; line-height: 1.5;">
                  An operator has requested access to the NexusNode network. Use the neural code below to authorize this session.
                </p>

                <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 30px;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a;">
                    ${otpCode}
                  </span>
                </div>

                <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">
                  This code will expire in <strong style="color: #e11d48;">5 minutes</strong>. <br>
                  If you did not request this, please ignore this email.
                </p>
              </div>

              <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="color: #cbd5e1; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
                  Shielding Your Neural Data &copy; 2026 NexusNode AI
                </p>
              </div>
            </div>
          </div>
        `,
    });
    logger.info("auth_smtp_handshake_success", {
      context: contextLabel,
      email: maskEmail(email),
    });
  } catch (error) {
    logger.error("auth_smtp_handshake_failed", {
      context: contextLabel,
      email: maskEmail(email),
      error: error.message,
    });
    throw error;
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      logger.warn("auth_missing_token", {
        requestId: req.id,
        path: req.originalUrl,
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id email full_name");

    if (!user) {
      logger.warn("auth_user_not_found", {
        requestId: req.id,
        userId: String(payload?.sub || ""),
        path: req.originalUrl,
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    logger.warn("auth_token_invalid", {
      requestId: req.id,
      path: req.originalUrl,
      error: error?.message || "Invalid token",
    });
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
    return res
      .status(500)
      .json({ message: "Failed to send verification code" });
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
      logger.warn("auth_register_duplicate_email", {
        email: maskEmail(email),
        collection: User.collection.name,
      });
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = await TempCode.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      logger.warn("auth_register_invalid_otp", {
        email: maskEmail(email),
        collection: TempCode.collection.name,
      });
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    const pwd_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      full_name,
      pwd_hash,
      isVerified: true,
    });

    logger.info("auth_register_success", {
      userId: String(user._id),
      email: maskEmail(email),
      collection: User.collection.name,
    });

    await TempCode.deleteMany({ email });
    logger.info("auth_register_otp_consumed", {
      email: maskEmail(email),
      collection: TempCode.collection.name,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    logger.error("auth_register_failed", { error: error.message });
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select(
      "_id email full_name pwd_hash",
    );
    if (!user) {
      logger.warn("auth_login_user_not_found", {
        email: maskEmail(email),
        collection: User.collection.name,
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(password, user.pwd_hash);
    if (!passwordOk) {
      logger.warn("auth_login_invalid_password", { email: maskEmail(email) });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: IS_PRODUCTION ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("auth_login_success", {
      userId: String(user._id),
      email: maskEmail(email),
      cookie: "token",
    });

    return res.status(200).json({
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (error) {
    logger.error("auth_login_failed", { error: error.message });
    return res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
  });
  logger.info("auth_logout_success", { cookie: "token" });
  return res.status(200).json({ message: "Logout successful" });
};
