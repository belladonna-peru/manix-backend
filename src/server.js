import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { initSocket } from "./sockets/socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MANIX server running on port ${PORT}`);
});