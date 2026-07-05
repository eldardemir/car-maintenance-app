import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../prismaClient.js";
import { JWT_SECRET } from "../../config/env.js";
import { isNonEmptyString } from "../../utils/validation.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: "Email i password su obavezni" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ message: "User ne postoji" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Pogrešan password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
