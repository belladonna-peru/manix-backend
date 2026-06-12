import prisma from "../config/prisma.js";

export const createComment = async ({ userId, momentId, content }) => {
  return prisma.comment.create({
    data: {
      content,
      userId,
      momentId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          vibe: true,
        },
      },
    },
  });
};

export const getCommentsByMoment = async (momentId) => {
  return prisma.comment.findMany({
    where: {
      momentId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          vibe: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};