import prisma from "../config/prisma.js";

const userSelect = {
  id: true,
  username: true,
  avatar: true,
  vibe: true,
  bio: true,
  zoneName: true,
  locationMode: true,
  liveLat: true,
  liveLng: true,
};

const getFriendshipIds = (a, b) => {
  return a < b
    ? { userOneId: a, userTwoId: b }
    : { userOneId: b, userTwoId: a };
};

export const sendFriendRequest = async ({ senderId, receiverId }) => {
  if (senderId === receiverId) {
    throw new Error("No puedes enviarte solicitud a ti mismo");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });

  if (!receiver) {
    throw new Error("Usuario no encontrado");
  }

  const friendshipIds = getFriendshipIds(senderId, receiverId);

  const existingFriendship = await prisma.friendship.findFirst({
    where: friendshipIds,
  });

  if (existingFriendship) {
    throw new Error("Ya son amigos");
  }

  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existingRequest) {
    throw new Error("Ya existe una solicitud pendiente");
  }

  return prisma.friendRequest.create({
    data: {
      senderId,
      receiverId,
    },
    include: {
      receiver: {
        select: userSelect,
      },
    },
  });
};

export const getReceivedRequests = async (userId) => {
  return prisma.friendRequest.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      sender: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const acceptFriendRequest = async ({ requestId, userId }) => {
  const request = await prisma.friendRequest.findFirst({
    where: {
      id: requestId.trim(),
    },
  });

  if (!request) {
    throw new Error("Solicitud no encontrada");
  }

  if (request.receiverId !== userId.trim()) {
    throw new Error("No autorizado");
  }

  const friendshipIds = getFriendshipIds(request.senderId, request.receiverId);

  const existingFriendship = await prisma.friendship.findFirst({
    where: friendshipIds,
  });

  if (existingFriendship) {
    await prisma.friendRequest.delete({
      where: { id: request.id },
    });

    return existingFriendship;
  }

  const friendship = await prisma.friendship.create({
    data: friendshipIds,
    include: {
      userOne: { select: userSelect },
      userTwo: { select: userSelect },
    },
  });

  await prisma.friendRequest.delete({
    where: {
      id: request.id,
    },
  });

  return friendship;
};

export const getFriends = async (userId) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
    include: {
      userOne: { select: userSelect },
      userTwo: { select: userSelect },
    },
  });

  return friendships.map((friendship) => {
    return friendship.userOneId === userId
      ? friendship.userTwo
      : friendship.userOne;
  });
};