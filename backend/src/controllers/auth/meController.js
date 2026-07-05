import { prisma } from "../../prismaClient.js";

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    res.json({
  id: user.id,
  email: user.email,
  plan: user.plan,
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};