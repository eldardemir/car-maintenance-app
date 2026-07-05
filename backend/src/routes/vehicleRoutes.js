import express from "express";
import {
  addVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "../controllers/vehicle/vehicleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addVehicle);
router.get("/", authMiddleware, getVehicles);
router.patch("/:vehicleId", authMiddleware, updateVehicle);
router.delete("/:vehicleId", authMiddleware, deleteVehicle);

export default router;
