import prisma from "../config/prisma.js";

export const initSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("🟣 Usuario conectado:", socket.id);

    socket.on("user:online", async (userId) => {
      try {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date(),
          },
        });

        io.emit("presence:update", {
          userId,
          isOnline: true,
        });

      } catch (error) {
        console.log(error);
      }
    });

    socket.on("location:update", async (payload) => {
  try {
    const {
      userId,
      liveLat,
      liveLng,
      zoneName,
      locationMode,
    } = payload;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        liveLat,
        liveLng,
        zoneName,
        locationMode,
        lastLocationUpdate: new Date(),
      },
    });

    io.emit("location:updated", {
      userId,
      liveLat,
      liveLng,
      zoneName,
      locationMode,
    });

  } catch (error) {
    console.log(error);
  }
});

    socket.on("join:conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leave:conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("message:send", ({ conversationId, message }) => {
      io.to(conversationId).emit("message:new", message);
    });

    socket.on("typing:start", ({ conversationId, user }) => {
      socket.to(conversationId).emit("typing:start", user);
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:stop");
    });


    // ── Stream events ──────────────────────────────────────────────────────
    socket.on("stream:join", ({ streamId, userId }) => {
      socket.join(`stream:${streamId}`);
    });

    socket.on("stream:leave", ({ streamId }) => {
      socket.leave(`stream:${streamId}`);
    });

    socket.on("stream:chat", ({ streamId, message }) => {
      io.to(`stream:${streamId}`).emit("stream:chat", message);
    });

    socket.on("disconnect", async () => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            socketId: socket.id,
          },
        });

        if (user) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isOnline: false,
              socketId: null,
              lastSeen: new Date(),
            },
          });

          io.emit("presence:update", {
            userId: user.id,
            isOnline: false,
          });
        }

        console.log("⚫ Usuario desconectado:", socket.id);

      } catch (error) {
        console.log(error);
      }
    });
  });
};