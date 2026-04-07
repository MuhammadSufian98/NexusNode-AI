import express from "express";
import multer from "multer";

import { requireAuth } from "../auth/auth.controller.js";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from "./profile.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/me", requireAuth, getProfile);
router.patch("/", requireAuth, updateProfile);
router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

export default router;
