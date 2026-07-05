import express from "express";
import { getOverview } from "./overviewController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getOverview);

export default router;
