import prisma from "../config/prisma.js";

// Actualizar ubicación del usuario en tiempo real
export const updateLocation = async ({ userId, lat, lng, liveLat, liveLng, locationMode, zoneName }) => {
  const finalLat = liveLat ?? lat;
  const finalLng = liveLng ?? lng;
  return prisma.user.update({
    where: { id: userId },
    data: {
      liveLat: finalLat ? parseFloat(finalLat) : null,
      liveLng: finalLng ? parseFloat(finalLng) : null,
      locationMode: locationMode || "approximate",
      zoneName: zoneName || "Zona activa",
      isOnline: true,
      lastSeen: new Date(),
    },
    select: { id: true, liveLat: true, liveLng: true, locationMode: true },
  });
};

// Obtener usuarios activos visibles para el usuario actual
export const getActiveUsers = async (requesterId) => {
  // Obtener amigos del usuario
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userOneId: requesterId }, { userTwoId: requesterId }] },
    select: { userOneId: true, userTwoId: true },
  });

  const friendIds = friendships.map((f) =>
    f.userOneId === requesterId ? f.userTwoId : f.userOneId
  );

  // Obtener usuarios que comparten ubicación con el requester
  const locationShares = await prisma.locationShare.findMany({
    where: { friendId: requesterId },
    select: { ownerId: true },
  });
  const sharingWithMe = locationShares.map((s) => s.ownerId);

  // Usuarios visibles = amigos que comparten + quienes comparten conmigo
  const visibleIds = [...new Set([...friendIds, ...sharingWithMe])];

  const users = await prisma.user.findMany({
    where: {
      id: { in: visibleIds, not: requesterId },
      isOnline: true,
      locationMode: { not: "hidden" },
      liveLat: { not: null },
      liveLng: { not: null },
      lastSeen: { gte: new Date(Date.now() - 30 * 60 * 1000) }, // últimos 30 min
    },
    select: {
      id: true, username: true, avatar: true, vibe: true,
      liveLat: true, liveLng: true, locationMode: true,
      isOnline: true, isStreaming: true, streamTitle: true,
      accountType: true, lastSeen: true,
    },
  });

  return users.map((u) => ({
    ...u,
    lat: u.locationMode === "approximate"
      ? Number(Number(u.liveLat).toFixed(2))
      : u.liveLat,
    lng: u.locationMode === "approximate"
      ? Number(Number(u.liveLng).toFixed(2))
      : u.liveLng,
  }));
};

// Compartir ubicación con un amigo específico
export const shareLocationWithFriend = async ({ ownerId, friendId, share }) => {
  if (share) {
    return prisma.locationShare.upsert({
      where: { ownerId_friendId: { ownerId, friendId } },
      create: { ownerId, friendId, mode: "exact" },
      update: { mode: "exact" },
    });
  } else {
    return prisma.locationShare.deleteMany({ where: { ownerId, friendId } });
  }
};

// Actualizar modo de ubicación
export const updateLocationMode = async ({ userId, locationMode }) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      locationMode,
      ...(locationMode === "hidden" && { liveLat: null, liveLng: null }),
    },
    select: { id: true, locationMode: true },
  });
};

// Marcar usuario como offline
export const setOffline = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isOnline: false, lastSeen: new Date() },
    select: { id: true },
  }).catch(() => {});
};
