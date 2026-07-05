import { prisma } from "../../prismaClient.js";

export const getOverview = async (req, res) => {
  try {
    const userId = req.user.userId;

    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
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
      // SERVICES TOTAL
      v.services.forEach((s) => {
        totalSpent += s.price;
      });

      // REMINDERS STATUS
      v.reminders.forEach((r) => {
        const due = new Date(r.dueDate);
        const diffDays = Math.ceil(
          (due - now) / (1000 * 60 * 60 * 24)
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
    res.status(500).json({ message: err.message });
  }
};
