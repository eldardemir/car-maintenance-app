import express from "express";
import {
  addService,
  deleteService,
  getServices,
  getTotalCost,
  updateService,
} from "../controllers/service/serviceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addService);
router.get("/total/:vehicleId", authMiddleware, getTotalCost);
router.get("/:vehicleId", authMiddleware, getServices);
router.patch("/:serviceId", authMiddleware, updateService);
router.delete("/:serviceId", authMiddleware, deleteService);

export default router;
