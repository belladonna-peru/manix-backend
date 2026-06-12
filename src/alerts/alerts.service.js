import prisma from "../config/prisma.js";

export const getAlerts = async (userId) => {
  const activeMoments = await prisma.moment.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          vibe: true,
        },
      },
      reactions: true,
      comments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const businesses = await prisma.business.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const activeUsers = await prisma.user.findMany({
    where: {
      liveLat: { not: null },
      liveLng: { not: null },
      lastLocationUpdate: {
        gte: new Date(Date.now() - 5 * 60 * 1000),
      },
    },
    select: {
      id: true,
      username: true,
      vibe: true,
      zoneName: true,
    },
    take: 5,
  });

  const alerts = [];

  activeMoments.forEach((moment) => {
    alerts.push({
      id: `moment-${moment.id}`,
      type: "moment",
      title: "⚡ Nuevo moment activo",
      message: `${moment.user.username}: ${moment.content}`,
      energy: 1 + moment.reactions.length + moment.comments.length,
      createdAt: moment.createdAt,
    });
  });

  businesses.forEach((business) => {
    alerts.push({
      id: `business-${business.id}`,
      type: "business",
      title: "☕ Negocio cerca",
      message: `${business.name} está disponible en ${business.zoneName || "tu zona"}`,
      energy: business.verified ? 5 : 2,
      createdAt: business.createdAt,
    });
  });

  activeUsers.forEach((user) => {
    if (user.id !== userId) {
      alerts.push({
        id: `user-${user.id}`,
        type: "user",
        title: "🔥 Usuario activo",
        message: `@${user.username} está activo en ${user.zoneName || "MANIX"}`,
        energy: 3,
        createdAt: user.lastLocationUpdate,
      });
    }
  });

  return alerts.sort((a, b) => b.energy - a.energy).slice(0, 10);
};