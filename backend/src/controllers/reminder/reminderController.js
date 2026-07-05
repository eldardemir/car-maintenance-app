import { prisma } from "../../prismaClient.js";
import {
  isNonEmptyString,
  parseInteger,
  parseValidDate,
} from "../../utils/validation.js";

export const getReminders = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        vehicleId: parsedVehicleId,
        vehicle: {
          userId,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addReminder = async (req, res) => {
  try {
    const { vehicleId, type, dueDate } = req.body;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);
    const parsedDueDate = parseValidDate(dueDate);

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
    }

    if (!isNonEmptyString(type)) {
      return res.status(400).json({ message: "Tip podsjetnika je obavezan" });
    }

    if (!parsedDueDate) {
      return res.status(400).json({ message: "Datum podsjetnika nije validan" });
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: parsedVehicleId,
        userId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vozilo nije pronađeno" });
    }

    const reminder = await prisma.reminder.create({
      data: {
        vehicleId: parsedVehicleId,
        type: type.trim(),
        dueDate: parsedDueDate,
      },
    });

    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.userId;
    const parsedReminderId = parseInteger(reminderId);

    if (!parsedReminderId) {
      return res.status(400).json({ message: "Podsjetnik nije validan" });
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parsedReminderId,
        vehicle: {
          userId,
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({ message: "Podsjetnik nije pronađen" });
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: parsedReminderId },
      data: { completed: true },
    });

    res.json(updatedReminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { type, dueDate, completed } = req.body;
    const userId = req.user.userId;
    const parsedReminderId = parseInteger(reminderId);
    const parsedDueDate = parseValidDate(dueDate);

    if (!parsedReminderId) {
      return res.status(400).json({ message: "Podsjetnik nije validan" });
    }

    if (!isNonEmptyString(type)) {
      return res.status(400).json({ message: "Tip podsjetnika je obavezan" });
    }

    if (!parsedDueDate) {
      return res.status(400).json({ message: "Datum podsjetnika nije validan" });
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parsedReminderId,
        vehicle: {
          userId,
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({ message: "Podsjetnik nije pronađen" });
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: parsedReminderId },
      data: {
        type: type.trim(),
        dueDate: parsedDueDate,
        completed: Boolean(completed),
      },
    });

    res.json(updatedReminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.userId;
    const parsedReminderId = parseInteger(reminderId);

    if (!parsedReminderId) {
      return res.status(400).json({ message: "Podsjetnik nije validan" });
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parsedReminderId,
        vehicle: {
          userId,
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({ message: "Podsjetnik nije pronađen" });
    }

    await prisma.reminder.delete({
      where: { id: parsedReminderId },
    });

    res.json({ message: "Podsjetnik je obrisan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
