import prisma from "../config/prisma.js";

export const updateUserVibe = async ({ userId, vibe }) => {
  return prisma.user.update({
    where: { id: userId },
    data: { vibe },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      vibe: true,
      bio: true,
      accountType: true,
    },
  });
};

export const updateUserBio = async ({ userId, bio }) => {
  return prisma.user.update({
    where: { id: userId },
    data: { bio },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      vibe: true,
      bio: true,
      accountType: true,
    },
  });
};

export const updateAccountMode = async ({ userId, accountType }) => {
  const allowedTypes = ["normal", "business", "streamer"];

  if (!allowedTypes.includes(accountType)) {
    throw new Error("Tipo de cuenta no válido");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { accountType },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      vibe: true,
      bio: true,
      accountType: true,
      businessPlan: true,
      isVerified: true,
    },
  });
};

export const getPublicUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatar: true,
      vibe: true,
      bio: true,
      accountType: true,
      isVerified: true,
      createdAt: true,
      isOnline: true,
      lastSeen: true,
      _count: {
        select: {
          followers: true,
          following: true,
          moments: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    momentsCount: user._count.moments,
    _count: undefined,
  };
};
