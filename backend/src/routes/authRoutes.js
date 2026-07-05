import express from "express";
import { register } from "../controllers/auth/registercontroller.js";
import { login } from "../controllers/auth/logincontroller.js";
import { me } from "../controllers/auth/meController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;
