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
            lastSeen: new Date(),
            isOnline: true,
          },
        });

        // 🔒 Privacidad: en modo aproximado, el broadcast sale redondeado (~1 km)
        const approx = locationMode === "approximate";
        const eventPayload = {
          userId,
          liveLat: approx && liveLat != null ? Number(Number(liveLat).toFixed(2)) : liveLat,
          liveLng: approx && liveLng != null ? Number(Number(liveLng).toFixed(2)) : liveLng,
          zoneName,
          locationMode,
        };

        // 🔒 FIX PRIVACIDAD: antes era io.emit() global → TODOS los conectados
        // recibían tus coordenadas. Ahora la posición viaja SOLO a los sockets
        // de los usuarios con quienes compartiste ubicación (share vigente).
        const shares = await prisma.locationShare.findMany({
          where: {
            ownerId: userId,
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: {
            friend: { select: { socketId: true } },
          },
        });

        for (const s of shares) {
          if (s.friend?.socketId) {
            io.to(s.friend.socketId).emit("location:updated", eventPayload);
          }
        }
        // Eco al propio emisor (útil para depurar y para múltiples dispositivos)
        socket.emit("location:updated", eventPayload);

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

    // Confirmación de lectura: aviso a los demás de la conversación (el emisor)
    socket.on("messages:read", ({ conversationId }) => {
      socket.to(conversationId).emit("messages:read", { conversationId });
    });

    // Reacción a un mensaje: retransmitir a la conversación en vivo
    socket.on("message:reaction", ({ conversationId, reaction }) => {
      socket.to(conversationId).emit("message:reaction", reaction);
    });

    // Mensaje eliminado: retransmitir
    socket.on("message:deleted", ({ conversationId, messageId }) => {
      socket.to(conversationId).emit("message:deleted", { messageId });
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