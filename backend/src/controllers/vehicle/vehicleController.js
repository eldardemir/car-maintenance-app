import { prisma } from "../../prismaClient.js";
import {
  isValidImageDataUrl,
  isNonEmptyString,
  isValidYear,
  parseInteger,
} from "../../utils/validation.js";

export const addVehicle = async (req, res) => {
  try {
    const { name, year, tireYear, imageUrl } = req.body;
    const parsedYear = parseInteger(year);
    const parsedTireYear = tireYear === null || tireYear === undefined || tireYear === ""
      ? null
      : parseInteger(tireYear);

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Naziv vozila je obavezan" });
    }

    if (!isValidYear(parsedYear)) {
      return res.status(400).json({ message: "Godina vozila nije validna" });
    }

    if (parsedTireYear !== null && !isValidYear(parsedTireYear, 1900)) {
      return res.status(400).json({ message: "Godina guma nije validna" });
    }

    if (!isValidImageDataUrl(imageUrl)) {
      return res.status(400).json({ message: "Slika vozila nije validna" });
    }

    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
    where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ message: "Korisnik nije pronađen" });
    }

    const vehicleCount = await prisma.vehicle.count({
    where: { userId },
    });

    if (user.plan === "free" && vehicleCount >= 1) {
    return res.status(403).json({
        message: "Free plan allows only 1 vehicle. Upgrade to add more.",
    });
    }
    const vehicle = await prisma.vehicle.create({
      data: {
        name: name.trim(),
        year: parsedYear,
        tireYear: parsedTireYear,
        imageUrl: imageUrl || null,
        userId,
      },
    });

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getVehicles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
    });

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { name, year, tireYear, imageUrl } = req.body;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);
    const parsedYear = parseInteger(year);
    const parsedTireYear = tireYear === null || tireYear === undefined || tireYear === ""
      ? null
      : parseInteger(tireYear);

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
    }

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Naziv vozila je obavezan" });
    }

    if (!isValidYear(parsedYear)) {
      return res.status(400).json({ message: "Godina vozila nije validna" });
    }

    if (parsedTireYear !== null && !isValidYear(parsedTireYear, 1900)) {
      return res.status(400).json({ message: "Godina guma nije validna" });
    }

    if (!isValidImageDataUrl(imageUrl)) {
      return res.status(400).json({ message: "Slika vozila nije validna" });
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

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: parsedVehicleId },
      data: {
        name: name.trim(),
        year: parsedYear,
        tireYear: parsedTireYear,
        imageUrl: imageUrl || null,
      },
    });

    res.json(updatedVehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
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

    await prisma.$transaction([
      prisma.service.deleteMany({ where: { vehicleId: parsedVehicleId } }),
      prisma.reminder.deleteMany({ where: { vehicleId: parsedVehicleId } }),
      prisma.vehicle.delete({ where: { id: parsedVehicleId } }),
    ]);

    res.json({ message: "Vozilo je obrisano" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
