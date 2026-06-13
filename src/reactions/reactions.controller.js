import { createReaction } from "./reactions.service.js";
import { notifyReaction } from "../notifications/notifications.service.js";
import prisma from "../config/prisma.js";

export const create = async (req, res) => {
  try {
    const { momentId, type } = req.body;
    if (!momentId || !type) return res.status(400).json({ message: "momentId y type son obligatorios" });

    const reaction = await createReaction({ userId: req.user.id, momentId, type });
    res.status(201).json(reaction);

    // Solo notificar si fue una reacción nueva (no eliminada)
    if (!reaction.removed) {
      const moment = await prisma.moment.findUnique({
        where:  { id: momentId },
        select: { userId: true, content: true },
      });

      if (moment) {
        notifyReaction({
          reactorId:      req.user.id,
          ownerId:        moment.userId,
          reactorUsername: req.user.username,
          momentPreview:  moment.content,
        }).catch(() => {});
      }
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
