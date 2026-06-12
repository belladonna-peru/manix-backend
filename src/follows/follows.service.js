import prisma from "../config/prisma.js";

const userSelect = {
  id: true,
  username: true,
  avatar: true,
  vibe: true,
  bio: true,
  accountType: true,
  isOnline: true,
  zoneName: true,
  followersCount: true,
  followingCount: true,
};

export const followUser = async ({ followerId, followingId }) => {
  if (followerId === followingId) throw new Error("No puedes seguirte a ti mismo");

  const targetUser = await prisma.user.findUnique({ where: { id: followingId }, select: { id: true } });
  if (!targetUser) throw new Error("Usuario no encontrado");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  if (existing) throw new Error("Ya sigues a este usuario");

  const follow = await prisma.follow.create({
    data: { followerId, followingId },
    include: { following: { select: userSelect } },
  });

  // Actualizar contadores
  await prisma.user.update({
    where: { id: followingId },
    data: { followersCount: { increment: 1 } },
  });
  await prisma.user.update({
    where: { id: followerId },
    data: { followingCount: { increment: 1 } },
  });

  return follow;
};

export const unfollowUser = async ({ followerId, followingId }) => {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  if (!existing) throw new Error("No sigues a este usuario");

  await prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });

  // Decrementar contadores
  await prisma.user.update({
    where: { id: followingId },
    data: { followersCount: { decrement: 1 } },
  });
  await prisma.user.update({
    where: { id: followerId },
    data: { followingCount: { decrement: 1 } },
  });

  return { message: "Dejaste de seguir al usuario" };
};

export const getFollowers = async (userId) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });
  return followers.map((item) => item.follower);
};

export const getFollowing = async (userId) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });
  return following.map((item) => item.following);
};
