import prisma from "../config/prisma.js";

export const createMoment = async ({
  userId,
  content,
  imageUrl,
  location,
  expiresAt,
  lat,
  lng,
  locationMode,
}) => {
  return prisma.moment.create({
    data: {
      content,
      imageUrl,
      location,
      userId,
      expiresAt,
      lat,
      lng,
      locationMode,
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
      reactions: true,
      comments: {
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
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const getMoments = async () => {
  return prisma.moment.findMany({
    where: {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
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
      reactions: true,
      comments: {
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
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
