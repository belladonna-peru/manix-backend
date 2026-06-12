import { createReaction } from "./reactions.service.js";

export const create = async (req, res) => {
  try {
    const { momentId, type } = req.body;

    if (!momentId || !type) {
      return res.status(400).json({
        message: "momentId y type son obligatorios",
      });
    }

    const reaction = await createReaction({
      userId: req.user.id,
      momentId,
      type,
    });

    res.status(201).json(reaction);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};