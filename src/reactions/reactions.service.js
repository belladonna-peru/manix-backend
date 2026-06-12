import prisma from "../config/prisma.js";

export const createReaction = async ({ userId, momentId, type }) => {
  const existing = await prisma.reaction.findFirst({
    where: {
      userId,
      momentId,
      type,
    },
  });

  if (existing) {
    await prisma.reaction.delete({
      where: { id: existing.id },
    });

    return { removed: true, type };
  }

  const reaction = await prisma.reaction.create({
    data: {
      userId,
      momentId,
      type,
    },
  });

  return { removed: false, reaction };
};