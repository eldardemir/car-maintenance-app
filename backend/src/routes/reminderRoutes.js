import express from "express";
import {
  addReminder,
  completeReminder,
  deleteReminder,
  getReminders,
  updateReminder,
} from "../controllers/reminder/reminderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addReminder);
router.get("/:vehicleId", authMiddleware, getReminders);
router.patch("/:reminderId/complete", authMiddleware, completeReminder);
router.patch("/:reminderId", authMiddleware, updateReminder);
router.delete("/:reminderId", authMiddleware, deleteReminder);

export default router;
