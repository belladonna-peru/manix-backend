import prisma from "../config/prisma.js";

export const createPromotion = async ({ businessId, title, description, type, value, code, minOrder, startsAt, endsAt, usageLimit }) => {
  return prisma.promotion.create({
    data: {
      businessId, title, description, type,
      value: parseFloat(value) || 0,
      code: code?.trim().toUpperCase() || null,
      minOrder: minOrder ? parseFloat(minOrder) : null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt:   endsAt   ? new Date(endsAt)   : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      isActive: true,
    },
  });
};

export const getBusinessPromotions = async (businessId) => {
  return prisma.promotion.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
};

export const getActivePromotions = async (businessId) => {
  const now = new Date();
  return prisma.promotion.findMany({
    where: {
      businessId,
      isActive: true,
      OR: [
        { endsAt: null },
        { endsAt: { gte: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
};

export const togglePromotion = async ({ promotionId, businessId }) => {
  const promo = await prisma.promotion.findFirst({ where: { id: promotionId, businessId } });
  if (!promo) throw new Error("Promoción no encontrada");
  return prisma.promotion.update({
    where: { id: promotionId },
    data: { isActive: !promo.isActive },
  });
};

export const deletePromotion = async ({ promotionId, businessId }) => {
  const promo = await prisma.promotion.findFirst({ where: { id: promotionId, businessId } });
  if (!promo) throw new Error("Promoción no encontrada");
  return prisma.promotion.delete({ where: { id: promotionId } });
};

export const validateCoupon = async ({ code, businessId, orderTotal }) => {
  const promo = await prisma.promotion.findFirst({
    where: {
      businessId, code: code.toUpperCase(), isActive: true, type: "coupon",
      OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
    },
  });
  if (!promo) throw new Error("Cupón inválido o expirado");
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) throw new Error("Cupón agotado");
  if (promo.minOrder && orderTotal < promo.minOrder) throw new Error(`Monto mínimo: S/ ${promo.minOrder}`);
  return promo;
};
