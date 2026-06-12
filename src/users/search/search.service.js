import prisma from "../../config/prisma.js";

const userSelect = {
  id: true,
  username: true,
  avatar: true,
  vibe: true,
  bio: true,
  zoneName: true,
  locationMode: true,
};

export const searchUsers = async ({ query, currentUserId }) => {
  const value = query?.trim();

  if (!value || value.length < 2) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: currentUserId,
          },
        },
        {
          OR: [
            {
              username: {
                contains: value,
                mode: "insensitive",
              },
            },
            {
              id: {
                startsWith: value,
              },
            },
          ],
        },
      ],
    },
    select: userSelect,
    take: 20,
    orderBy: {
      username: "asc",
    },
  });
};