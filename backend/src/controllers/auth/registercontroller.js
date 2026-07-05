import bcrypt from "bcrypt";
import { prisma } from "../../prismaClient.js";
import { isNonEmptyString } from "../../utils/validation.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: "Email i password su obavezni" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password mora imati najmanje 6 karaktera" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Korisnik sa ovim emailom već postoji" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
