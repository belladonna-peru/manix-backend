import prisma from "../config/prisma.js";

// Include reutilizable (misma forma que el feed)
const momentInclude = {
  user: { select: { id: true, username: true, avatar: true, vibe: true } },
  reactions: true,
  comments: {
    include: { user: { select: { id: true, username: true, avatar: true, vibe: true } } },
    orderBy: { createdAt: "asc" },
  },
};

// ── Guardar / quitar de guardados (toggle) ──
export const toggleSaveMoment = async ({ userId, momentId }) => {
  const existing = await prisma.savedMoment.findUnique({
    where: { userId_momentId: { userId, momentId } },
  });
  if (existing) {
    await prisma.savedMoment.delete({ where: { id: existing.id } });
    return { saved: false };
  }
  await prisma.savedMoment.create({ data: { userId, momentId } });
  return { saved: true };
};

// ── Moments que guardé ──
export const getSavedMoments = async (userId) => {
  const saved = await prisma.savedMoment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { moment: { include: momentInclude } },
  });
  return saved.map((s) => s.moment).filter(Boolean);
};

// ── Moments a los que reaccioné (Me gusta) ──
export const getLikedMoments = async (userId) => {
  const reactions = await prisma.reaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { moment: { include: momentInclude } },
  });
  // Dedupe por moment (por si hubiera varias reacciones)
  const seen = new Set();
  const out = [];
  for (const r of reactions) {
    if (r.moment && !seen.has(r.moment.id)) { seen.add(r.moment.id); out.push(r.moment); }
  }
  return out;
};

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
