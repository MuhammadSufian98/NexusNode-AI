import express from "express";
import multer from "multer";
import {
  avatar,
  login,
  logout,
  me,
  profile,
  register,
  requireAuth,
  verifyEmail,
} from "./auth.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/verify-email", verifyEmail);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, profile);
router.post("/avatar", requireAuth, upload.single("avatar"), avatar);

export default router;
