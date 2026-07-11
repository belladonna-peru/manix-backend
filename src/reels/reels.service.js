import prisma from "../config/prisma.js";

const userSelect = {
  id: true, username: true, avatar: true, vibe: true,
  accountType: true, isStreaming: true,
};

// Da forma al reel para el frontend (views/likes/comments + flag liked)
const shape = (r, myLikes = new Set()) => ({
  id: r.id,
  createdAt: r.createdAt,
  title: r.title,
  videoUrl: r.videoUrl,
  thumbnailUrl: r.thumbnailUrl,
  duration: r.duration,
  views: r.views,
  likes: r.likesCount,
  comments: r.commentsCount,
  type: "reel",
  liked: myLikes.has(r.id),
  user: r.user,
  business: r.user?.accountType === "business" ? { name: r.user.username, category: "" } : undefined,
});

export const createReel = async ({ userId, videoUrl, thumbnailUrl = null, title = "", duration = null }) => {
  if (!videoUrl) throw new Error("Falta el video");
  const reel = await prisma.reel.create({
    data: {
      userId, videoUrl, thumbnailUrl,
      title: (title || "").slice(0, 120),
      duration: duration != null ? parseInt(duration, 10) : null,
    },
    include: { user: { select: userSelect } },
  });
  return shape(reel);
};

export const getReels = async ({ userId, filter = "para_ti" }) => {
  let where = {};
  if (filter === "siguiendo") {
    const following = await prisma.follow.findMany({
      where: { followerId: userId }, select: { followingId: true },
    });
    where = { userId: { in: following.map((f) => f.followingId) } };
  } else if (filter === "negocios") {
    where = { user: { accountType: "business" } };
  } else if (filter === "streams") {
    where = { user: { accountType: "streamer" } };
  }

  const reels = await prisma.reel.findMany({
    where,
    include: { user: { select: userSelect } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Qué reels ya me gustaron (para pintar el corazón lleno)
  const myLikes = await prisma.reelLike.findMany({
    where: { userId, reelId: { in: reels.map((r) => r.id) } },
    select: { reelId: true },
  });
  const likedSet = new Set(myLikes.map((l) => l.reelId));

  return reels.map((r) => shape(r, likedSet));
};

export const toggleReelLike = async ({ reelId, userId }) => {
  const existing = await prisma.reelLike.findUnique({
    where: { reelId_userId: { reelId, userId } },
  });

  if (existing) {
    await prisma.reelLike.delete({ where: { id: existing.id } });
    const reel = await prisma.reel.update({
      where: { id: reelId }, data: { likesCount: { decrement: 1 } }, select: { likesCount: true },
    });
    return { liked: false, likes: Math.max(0, reel.likesCount) };
  }

  await prisma.reelLike.create({ data: { reelId, userId } });
  const reel = await prisma.reel.update({
    where: { id: reelId }, data: { likesCount: { increment: 1 } }, select: { likesCount: true },
  });
  return { liked: true, likes: reel.likesCount };
};

export const addReelView = async (reelId) => {
  return prisma.reel.update({
    where: { id: reelId }, data: { views: { increment: 1 } }, select: { views: true },
  }).catch(() => null);
};
