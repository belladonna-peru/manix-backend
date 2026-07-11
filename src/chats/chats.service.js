import prisma from "../config/prisma.js";

const userSelect = {
  id: true,
  username: true,
  avatar: true,
  vibe: true,
};

const getConversationIds = (a, b) => {
  return a < b
    ? { userOneId: a, userTwoId: b }
    : { userOneId: b, userTwoId: a };
};

export const getOrCreateConversation = async ({ userId, friendId }) => {
  if (userId === friendId) {
    throw new Error("No puedes abrir chat contigo mismo");
  }

  const ids = getConversationIds(userId, friendId);

  const existing = await prisma.conversation.findUnique({
    where: {
      userOneId_userTwoId: ids,
    },
    include: {
      userOne: { select: userSelect },
      userTwo: { select: userSelect },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: ids,
    include: {
      userOne: { select: userSelect },
      userTwo: { select: userSelect },
    },
  });
};

export const getConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
    include: {
      userOne: { select: userSelect },
      userTwo: { select: userSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getMessages = async ({ conversationId, userId }) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
  });

  if (!conversation) {
    throw new Error("Conversación no encontrada");
  }

  // Marcar como leídos los mensajes que me envió el otro (confirmación de lectura)
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: userSelect },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const createMessage = async ({ conversationId, senderId, content, type = "text", mediaUrl = null, duration = null, lat = null, lng = null }) => {
  // El texto no puede ir vacío; imagen/audio/ubicación no necesitan texto.
  if (type === "text" && (!content || content.trim().length < 1)) {
    throw new Error("El mensaje no puede estar vacío");
  }
  if ((type === "image" || type === "audio") && !mediaUrl) {
    throw new Error("Falta el archivo");
  }
  if (type === "location" && (lat == null || lng == null)) {
    throw new Error("Falta la ubicación");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userOneId: senderId }, { userTwoId: senderId }],
    },
  });

  if (!conversation) {
    throw new Error("No autorizado");
  }

  return prisma.message.create({
    data: {
      conversationId,
      senderId,
      content: (content || "").trim(),
      type,
      mediaUrl,
      duration: duration != null ? parseInt(duration, 10) : null,
      lat: lat != null ? parseFloat(lat) : null,
      lng: lng != null ? parseFloat(lng) : null,
    },
    include: {
      sender: { select: userSelect },
    },
  });
};