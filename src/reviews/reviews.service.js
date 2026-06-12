import prisma from "../config/prisma.js";

export const createReview = async ({ userId, businessId, orderId, rating, comment }) => {
  if (rating < 1 || rating > 5) throw new Error("Rating debe ser entre 1 y 5");

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: userId, businessId, status: "delivered" },
  });
  if (!order) throw new Error("Solo puedes reseñar pedidos entregados");

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) throw new Error("Ya reseñaste este pedido");

  const review = await prisma.review.create({
    data: { userId, businessId, orderId, rating, comment },
    include: { user: { select: { id: true, username: true, vibe: true } } },
  });

  // Actualizar rating promedio en el negocio (calculado)
  return review;
};

export const getBusinessReviews = async (businessId) => {
  const reviews = await prisma.review.findMany({
    where: { businessId },
    include: { user: { select: { id: true, username: true, vibe: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total  = reviews.length;
  const avg    = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
  const dist   = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }));

  return { reviews, total, avg: Math.round(avg * 10) / 10, distribution: dist };
};

export const replyReview = async ({ reviewId, businessId, reply }) => {
  const review = await prisma.review.findFirst({ where: { id: reviewId, businessId } });
  if (!review) throw new Error("Reseña no encontrada");
  return prisma.review.update({
    where: { id: reviewId },
    data: { reply, repliedAt: new Date() },
    include: { user: { select: { id: true, username: true } } },
  });
};
