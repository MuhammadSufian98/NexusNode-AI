import express from "express";
import { requireAuth } from "../auth/auth.controller.js";
import { getOverviewStats } from "../controllers/overview.controller.js";

const router = express.Router();

router.get("/", requireAuth, getOverviewStats);

export default router;
