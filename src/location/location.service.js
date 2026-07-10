import prisma from "../config/prisma.js";

// ═══════════════════════════════════════════════════════════════════════════════
//  MANIX LOCATION — modelo "compartir explícito" (como Instagram / WhatsApp):
//  · Usuario A comparte su ubicación con B → SOLO entonces B ve a A en el mapa.
//  · Ser amigos NO basta: el share es explícito, por persona y con duración.
//  · Duraciones: 1h, 8h o "always" (hasta apagarlo). Expiran solas en el server.
//  · Presencia por SEÑAL: apareces si tu ubicación llegó en los últimos 10 min.
//  · Privacidad: en modo aproximado las coords salen redondeadas DEL SERVIDOR.
// ═══════════════════════════════════════════════════════════════════════════════

// Ventana de frescura: si no llega señal en este tiempo, el pin desaparece
const SIGNAL_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

// Calcula expiresAt según la duración elegida
const computeExpiry = (duration) => {
  if (duration === "15m")   return new Date(Date.now() + 15 * 60 * 1000);
  if (duration === "1h")    return new Date(Date.now() + 1  * 60 * 60 * 1000);
  if (duration === "8h")    return new Date(Date.now() + 8  * 60 * 60 * 1000);
  return null; // "always" = sin expiración
};

// Condición Prisma reutilizable: share vigente
const ACTIVE_SHARE = {
  isActive: true,
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
};

// Desactiva en BD los shares vencidos (housekeeping barato, se llama en cada lectura)
const deactivateExpired = () =>
  prisma.locationShare.updateMany({
    where: { isActive: true, expiresAt: { not: null, lte: new Date() } },
    data: { isActive: false },
  }).catch(() => {});

// ─── Actualizar ubicación del usuario (app abierta o en segundo plano) ─────────

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

// ─── Usuarios visibles para mí: SOLO quienes me compartieron su ubicación ──────

export const getActiveUsers = async (requesterId) => {
  await deactivateExpired();

  // 1. Shares vigentes HACIA mí (ellos son los owners, yo el friend)
  const shares = await prisma.locationShare.findMany({
    where: { friendId: requesterId, ...ACTIVE_SHARE },
    select: { ownerId: true, expiresAt: true },
  });
  if (shares.length === 0) return [];

  const expiryByOwner = Object.fromEntries(shares.map((s) => [s.ownerId, s.expiresAt]));
  const visibleIds = shares.map((s) => s.ownerId);

  // 2. Mis amistades (solo para marcar isFriend en la respuesta)
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userOneId: requesterId }, { userTwoId: requesterId }] },
    select: { userOneId: true, userTwoId: true },
  });
  const friendIds = new Set(
    friendships.map((f) => (f.userOneId === requesterId ? f.userTwoId : f.userOneId))
  );

  // 3. De los que me comparten, solo los que tienen señal fresca y no están ocultos
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
  // El cliente NUNCA recibe la posición exacta de alguien en modo aproximado.
  return users.map((u) => {
    const approx = u.locationMode === "approximate";
    const lat = approx ? Number(Number(u.liveLat).toFixed(2)) : Number(u.liveLat);
    const lng = approx ? Number(Number(u.liveLng).toFixed(2)) : Number(u.liveLng);
    return {
      ...u,
      liveLat: lat, liveLng: lng, lat, lng,
      isFriend: friendIds.has(u.id),
      shareExpiresAt: expiryByOwner[u.id] || null, // cuándo dejaré de verlo
    };
  });
};

// ─── Compartir / dejar de compartir con un amigo específico ────────────────────
//  🔧 FIX CRÍTICO: el modelo exige `duration` (String NOT NULL). Antes se creaba
//  sin ese campo → Prisma lanzaba "Argument duration is missing" → el share
//  NUNCA se guardaba y el otro usuario jamás te veía en el mapa.

export const shareLocationWithFriend = async ({ ownerId, friendId, share, duration = "always" }) => {
  if (!friendId) throw new Error("friendId es obligatorio");
  if (friendId === ownerId) throw new Error("No puedes compartir contigo mismo");

  if (share) {
    // Seguridad: solo se puede compartir con AMIGOS confirmados
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userOneId: ownerId,  userTwoId: friendId },
          { userOneId: friendId, userTwoId: ownerId },
        ],
      },
      select: { id: true },
    });
    if (!friendship) throw new Error("Solo puedes compartir tu ubicación con tus amigos");

    const expiresAt = computeExpiry(duration);
    return prisma.locationShare.upsert({
      where:  { ownerId_friendId: { ownerId, friendId } },
      create: { ownerId, friendId, mode: "exact", duration, expiresAt, isActive: true },
      update: { mode: "exact", duration, expiresAt, isActive: true },
    });
  }

  // Apagar: deleteMany no falla si el registro no existe
  return prisma.locationShare.deleteMany({ where: { ownerId, friendId } });
};

// ─── Mis shares: con quién comparto YO + quién comparte CONMIGO ────────────────
//  Permite al frontend restaurar los switches al abrir la app.

export const getMyShares = async (userId) => {
  await deactivateExpired();

  const [owned, received] = await Promise.all([
    prisma.locationShare.findMany({
      where: { ownerId: userId, ...ACTIVE_SHARE },
      select: {
        friendId: true, duration: true, expiresAt: true, createdAt: true,
        friend: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.locationShare.findMany({
      where: { friendId: userId, ...ACTIVE_SHARE },
      select: {
        ownerId: true, duration: true, expiresAt: true, createdAt: true,
        owner: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    sharingWith: owned.map((s) => ({
      friendId: s.friendId,
      username: s.friend?.username,
      avatar: s.friend?.avatar,
      duration: s.duration,
      expiresAt: s.expiresAt,
    })),
    sharedWithMe: received.map((s) => ({
      ownerId: s.ownerId,
      username: s.owner?.username,
      avatar: s.owner?.avatar,
      duration: s.duration,
      expiresAt: s.expiresAt,
    })),
  };
};

// ─── Actualizar modo de ubicación ──────────────────────────────────────────────

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

// ─── Marcar usuario como offline (presencia de chat — ya NO afecta al mapa) ────

export const setOffline = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isOnline: false, lastSeen: new Date() },
    select: { id: true },
  }).catch(() => {});
};