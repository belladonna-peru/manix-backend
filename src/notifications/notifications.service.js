import prisma from "../config/prisma.js";

// ── Enviar push notification via Expo ────────────────────────────────────────
export const sendPushNotification = async ({ token, title, body, data = {} }) => {
  if (!token || !token.startsWith("ExponentPushToken")) return;

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept":       "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to:    token,
        sound: "default",
        title,
        body,
        data,
        priority: "high",
      }),
    });
  } catch (error) {
    console.log("Push notification error:", error.message);
  }
};

// ── Guardar push token del usuario ───────────────────────────────────────────
export const savePushToken = async ({ userId, pushToken }) => {
  return prisma.user.update({
    where: { id: userId },
    data:  { pushToken },
    select: { id: true, pushToken: true },
  });
};

// ── Obtener token de un usuario ───────────────────────────────────────────────
export const getUserPushToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { pushToken: true },
  });
  return user?.pushToken || null;
};

// ── Notificaciones específicas ────────────────────────────────────────────────

export const notifyNewMessage = async ({ senderId, receiverId, senderUsername, preview }) => {
  const token = await getUserPushToken(receiverId);
  await sendPushNotification({
    token,
    title: `💬 @${senderUsername}`,
    body:  preview.length > 60 ? preview.slice(0, 60) + "…" : preview,
    data:  { type: "message", senderId },
  });
};

export const notifyFriendRequest = async ({ senderId, receiverId, senderUsername }) => {
  const token = await getUserPushToken(receiverId);
  await sendPushNotification({
    token,
    title: "👋 Nueva solicitud de amistad",
    body:  `@${senderUsername} quiere conectar contigo`,
    data:  { type: "friend_request", senderId },
  });
};

export const notifyFriendAccepted = async ({ acceptorId, requesterId, acceptorUsername }) => {
  const token = await getUserPushToken(requesterId);
  await sendPushNotification({
    token,
    title: "🎉 ¡Nueva conexión!",
    body:  `@${acceptorUsername} aceptó tu solicitud`,
    data:  { type: "friend_accepted", acceptorId },
  });
};

export const notifyReaction = async ({ reactorId, ownerId, reactorUsername, momentPreview }) => {
  if (reactorId === ownerId) return;
  const token = await getUserPushToken(ownerId);
  await sendPushNotification({
    token,
    title: "🔥 Reaccionaron a tu moment",
    body:  `@${reactorUsername}: "${momentPreview?.slice(0, 40)}"`,
    data:  { type: "reaction", reactorId },
  });
};

export const notifyComment = async ({ commenterId, ownerId, commenterUsername, commentPreview }) => {
  if (commenterId === ownerId) return;
  const token = await getUserPushToken(ownerId);
  await sendPushNotification({
    token,
    title: `💬 @${commenterUsername} comentó tu moment`,
    body:  commentPreview?.slice(0, 60) || "",
    data:  { type: "comment", commenterId },
  });
};

export const notifyBusinessOpen = async ({ businessId, businessName }) => {
  // Notificar a todos los seguidores del negocio
  try {
    const followers = await prisma.follow.findMany({
      where:   { followingId: businessId },
      include: { follower: { select: { pushToken: true } } },
    });

    const tokens = followers
      .map(f => f.follower.pushToken)
      .filter(t => t && t.startsWith("ExponentPushToken"));

    await Promise.allSettled(
      tokens.map(token =>
        sendPushNotification({
          token,
          title: "🟢 Negocio abierto",
          body:  `${businessName} acaba de abrir`,
          data:  { type: "business_open", businessId },
        })
      )
    );
  } catch (error) {
    console.log("notifyBusinessOpen error:", error.message);
  }
};
