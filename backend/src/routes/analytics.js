// backend/routes/analytics.js

import express from "express";
import { prisma } from "../prismaClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.userId },
      include: {
        services: true,
        reminders: true,
      },
    });

    let totalSpent = 0;
    let overdue = 0;
    let soon = 0;
    let ok = 0;

    const now = new Date();

    vehicles.forEach((v) => {
      v.services.forEach((s) => {
        totalSpent += s.price;
      });

      v.reminders.forEach((r) => {
        if (r.completed) return;

        const diffDays = Math.ceil(
          (new Date(r.dueDate) - now) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) overdue++;
        else if (diffDays <= 7) soon++;
        else ok++;
      });
    });

    res.json({
      totalSpent,
      overdue,
      soon,
      ok,
      vehicleCount: vehicles.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/costs-by-date", authMiddleware, async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        vehicle: {
          userId: req.user.userId,
        },
      },
      orderBy: { date: "asc" },
      include: {
        vehicle: {
          select: { name: true },
        },
      },
    });

    const totalsByDate = services.reduce((acc, service) => {
      const dateKey = service.date.toISOString().slice(0, 10);
      const current = acc.get(dateKey) || {
        date: dateKey,
        cost: 0,
        count: 0,
        vehicles: new Set(),
      };

      current.cost += service.price;
      current.count += 1;
      current.vehicles.add(service.vehicle.name);
      acc.set(dateKey, current);

      return acc;
    }, new Map());

    const data = Array.from(totalsByDate.values()).map((item) => ({
      date: item.date,
      cost: item.cost,
      count: item.count,
      vehicles: Array.from(item.vehicles),
    }));

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
