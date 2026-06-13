import prisma from "../config/prisma.js";

const userSelect = {
  id: true, username: true, email: true,
  avatar: true, vibe: true, bio: true, accountType: true,
};

export const updateUserVibe = async ({ userId, vibe }) => {
  return prisma.user.update({ where: { id: userId }, data: { vibe }, select: userSelect });
};

export const updateUserBio = async ({ userId, bio }) => {
  return prisma.user.update({ where: { id: userId }, data: { bio }, select: userSelect });
};

export const updateUserAvatar = async ({ userId, avatar }) => {
  return prisma.user.update({ where: { id: userId }, data: { avatar }, select: userSelect });
};

export const updateAccountMode = async ({ userId, accountType }) => {
  const allowedTypes = ["normal", "business", "streamer"];
  if (!allowedTypes.includes(accountType)) throw new Error("Tipo de cuenta no válido");
  return prisma.user.update({
    where: { id: userId },
    data: { accountType },
    select: { ...userSelect, businessPlan: true, isVerified: true },
  });
};

export const getPublicUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, username: true, avatar: true, vibe: true,
      bio: true, accountType: true, isVerified: true,
      createdAt: true, isOnline: true, lastSeen: true,
      _count: { select: { followers: true, following: true, moments: true } },
    },
  });
  if (!user) return null;
  return {
    ...user,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    momentsCount:   user._count.moments,
    _count: undefined,
  };
};
