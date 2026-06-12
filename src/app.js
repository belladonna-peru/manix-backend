import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./auth/auth.routes.js";
import momentRoutes from "./moments/moments.routes.js";
import reactionRoutes from "./reactions/reactions.routes.js";
import commentsRoutes from "./comments/comments.routes.js";
import usersRoutes from "./users/users.routes.js";
import friendsRoutes from "./friends/friends.routes.js";
import locationRoutes from "./location/location.routes.js";
import businessRoutes from "./business/business.routes.js";
import alertsRoutes from "./alerts/alerts.routes.js";
import chatsRoutes from "./chats/chats.routes.js";
import searchRoutes from "./users/search/search.routes.js";
import followsRoutes from "./follows/follows.routes.js";
import productsRoutes from "./products/products.routes.js";
import ordersRoutes from "./orders/orders.routes.js";
import streamRoutes from "./stream/stream.routes.js";
import promotionsRoutes from "./promotions/promotions.routes.js";
import reviewsRoutes from "./reviews/reviews.routes.js";
import walletRoutes from "./wallet/wallet.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MANIX backend running", version: "1.0.0" });
});

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/moments", momentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/follows", followsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/wallet", walletRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;
