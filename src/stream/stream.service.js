import prisma from "../config/prisma.js";

// ─── Iniciar stream ───────────────────────────────────────────────────────────
export const startStream = async ({ userId, title, description, category, lat, lng, zoneName }) => {
  // Cerrar streams activos anteriores
  await prisma.stream.updateMany({
    where: { userId, isLive: true },
    data:  { isLive: false, endedAt: new Date() },
  });

  // Crear nuevo stream
  const stream = await prisma.stream.create({
    data: { userId, title, description, category, lat, lng, zoneName, isLive: true },
    include: { user: { select: { id: true, username: true, avatar: true, vibe: true } } },
  });

  // Marcar usuario como streaming
  await prisma.user.update({
    where: { id: userId },
    data:  { isStreaming: true, streamTitle: title },
  });

  return stream;
};

// ─── Terminar stream ──────────────────────────────────────────────────────────
export const endStream = async (userId) => {
  const stream = await prisma.stream.findFirst({
    where: { userId, isLive: true },
  });

  if (!stream) throw new Error("No hay un stream activo");

  const duration = Math.floor((Date.now() - new Date(stream.createdAt).getTime()) / 1000);

  const ended = await prisma.stream.update({
    where: { id: stream.id },
    data:  { isLive: false, endedAt: new Date(), duration },
  });

  await prisma.user.update({
    where: { id: userId },
    data:  { isStreaming: false, streamTitle: null, streamViewers: 0 },
  });

  return ended;
};

// ─── Streams activos ──────────────────────────────────────────────────────────
export const getLiveStreams = async () => {
  return prisma.stream.findMany({
    where: { isLive: true },
    include: { user: { select: { id: true, username: true, avatar: true, vibe: true, zoneName: true } } },
    orderBy: { viewers: "desc" },
  });
};

// ─── Stats del streamer ───────────────────────────────────────────────────────
export const getStreamerStats = async (userId) => {
  const [streams, followers, currentStream] = await Promise.all([
    prisma.stream.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.stream.findFirst({ where: { userId, isLive: true } }),
  ]);

  const totalStreams   = streams.length;
  const totalDuration = streams.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalViewers  = streams.reduce((acc, s) => acc + (s.peakViewers || 0), 0);
  const avgViewers    = totalStreams > 0 ? Math.round(totalViewers / totalStreams) : 0;

  return {
    followers,
    totalStreams,
    totalDuration,
    totalViewers,
    avgViewers,
    isLive: !!currentStream,
    currentStream,
    recentStreams: streams.slice(0, 5),
  };
};

// ─── Eventos ──────────────────────────────────────────────────────────────────
export const createEvent = async ({ userId, title, description, scheduledAt, category, isPublic, maxViewers }) => {
  return prisma.streamEvent.create({
    data: { userId, title, description, scheduledAt: new Date(scheduledAt), category, isPublic, maxViewers },
  });
};

export const getMyEvents = async (userId) => {
  return prisma.streamEvent.findMany({
    where: { userId },
    orderBy: { scheduledAt: "asc" },
  });
};

export const deleteEvent = async ({ eventId, userId }) => {
  const event = await prisma.streamEvent.findFirst({ where: { id: eventId, userId } });
  if (!event) throw new Error("Evento no encontrado");
  return prisma.streamEvent.delete({ where: { id: eventId } });
};
