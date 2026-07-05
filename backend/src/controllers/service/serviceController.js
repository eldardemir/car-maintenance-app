import { prisma } from "../../prismaClient.js";
import {
  isValidServiceType,
  parseInteger,
  parsePositiveNumber,
  parseValidDate,
} from "../../utils/validation.js";

export const addService = async (req, res) => {
  try {
    const { vehicleId, type, price, date } = req.body;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);
    const parsedPrice = parsePositiveNumber(price);
    const parsedDate = date ? parseValidDate(date) : new Date();

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
    }

    if (!isValidServiceType(type)) {
      return res.status(400).json({ message: "Tip servisa nije validan" });
    }

    if (parsedPrice === null) {
      return res.status(400).json({ message: "Cijena servisa mora biti veća od 0" });
    }

    if (!parsedDate) {
      return res.status(400).json({ message: "Datum servisa nije validan" });
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

    const service = await prisma.service.create({
      data: {
        vehicleId: parsedVehicleId,
        type,
        price: parsedPrice,
        date: parsedDate,
      },
    });

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getServices = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
    }

    const services = await prisma.service.findMany({
      where: {
        vehicleId: parsedVehicleId,
        vehicle: {
          userId,
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getTotalCost = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const parsedVehicleId = parseInteger(vehicleId);

    if (!parsedVehicleId) {
      return res.status(400).json({ message: "Vozilo nije validno" });
    }

    const services = await prisma.service.findMany({
      where: {
        vehicleId: parsedVehicleId,
        vehicle: {
          userId,
        },
      },
    });

    const total = services.reduce((sum, s) => sum + s.price, 0);

    res.json({
      vehicleId: parsedVehicleId,
      totalCost: total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { type, price, date } = req.body;
    const userId = req.user.userId;
    const parsedServiceId = parseInteger(serviceId);
    const parsedPrice = parsePositiveNumber(price);
    const parsedDate = parseValidDate(date);

    if (!parsedServiceId) {
      return res.status(400).json({ message: "Servis nije validan" });
    }

    if (!isValidServiceType(type)) {
      return res.status(400).json({ message: "Tip servisa nije validan" });
    }

    if (parsedPrice === null) {
      return res.status(400).json({ message: "Cijena servisa mora biti veća od 0" });
    }

    if (!parsedDate) {
      return res.status(400).json({ message: "Datum servisa nije validan" });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parsedServiceId,
        vehicle: {
          userId,
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Servis nije pronađen" });
    }

    const updatedService = await prisma.service.update({
      where: { id: parsedServiceId },
      data: {
        type,
        price: parsedPrice,
        date: parsedDate,
      },
    });

    res.json(updatedService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.userId;
    const parsedServiceId = parseInteger(serviceId);

    if (!parsedServiceId) {
      return res.status(400).json({ message: "Servis nije validan" });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parsedServiceId,
        vehicle: {
          userId,
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Servis nije pronađen" });
    }

    await prisma.service.delete({
      where: { id: parsedServiceId },
    });

    res.json({ message: "Servis je obrisan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
