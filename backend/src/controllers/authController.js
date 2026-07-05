import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.json({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};