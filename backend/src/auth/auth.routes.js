import express from "express";
import {
  login,
  logout,
  register,
  verifyEmail,
} from "./auth.controller.js";

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
