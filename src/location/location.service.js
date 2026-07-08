import prisma from "../config/prisma.js";

// ═══════════════════════════════════════════════════════════════════════════════
//  MANIX LOCATION — presencia en el mapa por SEÑAL de ubicación, no por socket.
//  · Apareces si tu ubicación llegó en los últimos 10 min (el background manda cada 45s)
//  · Cerrar la app NO te borra del mapa mientras el modo LIVE siga activo
//  · Privacidad: en modo aproximado, las coords salen redondeadas del servidor
// ═══════════════════════════════════════════════════════════════════════════════

// Ventana de frescura: si no llega señal en este tiempo, el pin desaparece
const SIGNAL_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

// Actualizar ubicación del usuario en tiempo real (app abierta o en segundo plano)
export const updateLocation = async ({ userId, lat, lng, liveLat, liveLng, locationMode, zoneName }) => {
  const finalLat = liveLat ?? lat;
  const finalLng = liveLng ?? lng;
  return prisma.user.update({
    where: { id: userId },
    data: {
      liveLat: finalLat != null ? parseFloat(finalLat) : null,
      liveLng: finalLng != null ? parseFloat(finalLng) : null,
      locationMode: locationMode || "approximate",
      zoneName: zoneName || "Zona activa",
      isOnline: true,
      lastSeen: new Date(),
      lastLocationUpdate: new Date(),
    },
    select: { id: true, liveLat: true, liveLng: true, locationMode: true },
  });
};

// Obtener usuarios activos visibles para el usuario actual
export const getActiveUsers = async (requesterId) => {
  // Amigos del usuario
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userOneId: requesterId }, { userTwoId: requesterId }] },
    select: { userOneId: true, userTwoId: true },
  });

  const friendIds = friendships.map((f) =>
    f.userOneId === requesterId ? f.userTwoId : f.userOneId
  );

  // Usuarios que comparten ubicación explícitamente con el requester
  const locationShares = await prisma.locationShare.findMany({
    where: { friendId: requesterId },
    select: { ownerId: true },
  });
  const sharingWithMe = locationShares.map((s) => s.ownerId);

  const visibleIds = [...new Set([...friendIds, ...sharingWithMe])];

  const users = await prisma.user.findMany({
    where: {
      id: { in: visibleIds, not: requesterId },
      // 🔑 SIN filtro isOnline: la presencia en el mapa depende de la SEÑAL,
      //    no del socket. Así no desapareces al cerrar la app.
      locationMode: { not: "hidden" },
      liveLat: { not: null },
      liveLng: { not: null },
      lastSeen: { gte: new Date(Date.now() - SIGNAL_WINDOW_MS) },
    },
    select: {
      id: true, username: true, avatar: true, vibe: true,
      liveLat: true, liveLng: true, locationMode: true, zoneName: true,
      isOnline: true, isStreaming: true, streamTitle: true,
      accountType: true, lastSeen: true,
    },
  });

  // 🔒 Privacidad EN EL SERVIDOR: modo aproximado = coords redondeadas (~1 km).
  // Se sobreescriben liveLat/liveLng directamente para que el cliente
  // NUNCA reciba la posición exacta de alguien en modo aproximado.
  return users.map((u) => {
    const approx = u.locationMode === "approximate";
    const lat = approx ? Number(Number(u.liveLat).toFixed(2)) : Number(u.liveLat);
    const lng = approx ? Number(Number(u.liveLng).toFixed(2)) : Number(u.liveLng);
    return { ...u, liveLat: lat, liveLng: lng, lat, lng };
  });
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

// Marcar usuario como offline (presencia de chat — ya NO afecta al mapa)
export const setOffline = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isOnline: false, lastSeen: new Date() },
    select: { id: true },
  }).catch(() => {});
};