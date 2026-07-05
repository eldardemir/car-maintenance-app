import "./config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import analyticsRoutes from "./routes/analytics.js";
import reminderRoutes from "./routes/reminderRoutes.js";
const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "6mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "car-maintenance-api" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles",vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reminders", reminderRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server radi na ${PORT}`);
}); 

export default server;
