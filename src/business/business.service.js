import prisma from "../config/prisma.js";

export const getMyBusiness = async (ownerId) => {
  return prisma.business.findFirst({
    where: { ownerId },
    select: {
      id: true, name: true, description: true, category: true,
      logo: true, coverImage: true, lat: true, lng: true,
      zoneName: true, verified: true, isOpen: true, businessPlan: true,
      businessType: true, targetAudience: true, mainGoal: true, surveyDone: true,
      totalViews: true, totalOrders: true, totalRevenue: true,
      openTime: true, closeTime: true, workDays: true,
      whatsapp: true, instagram: true, website: true,
      catalog: true, createdAt: true, ownerId: true,
      owner: { select: { id: true, username: true, avatar: true, accountType: true } },
      products: { select: { id: true, name: true, price: true, isActive: true, stock: true, imageUrl: true, variants: true }, orderBy: { createdAt: "desc" } },
    },
  });
};

export const createBusiness = async ({ ownerId, name, description, category, lat, lng, zoneName, businessType, targetAudience, mainGoal }) => {
  const existing = await prisma.business.findFirst({ where: { ownerId } });
  if (existing) throw new Error("Ya tienes un negocio registrado");

  const business = await prisma.business.create({
    data: { ownerId, name, description, category, lat, lng, zoneName, businessType, targetAudience, mainGoal, surveyDone: true },
    select: { id: true, name: true, category: true, ownerId: true, businessPlan: true },
  });

  await prisma.user.update({
    where: { id: ownerId },
    data: { accountType: "business" },
  });

  return business;
};

export const updateBusiness = async ({ ownerId, ...data }) => {
  const business = await prisma.business.findFirst({ where: { ownerId } });
  if (!business) throw new Error("Negocio no encontrado");

  return prisma.business.update({
    where: { id: business.id },
    data: {
      ...(data.name        !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category    !== undefined && { category: data.category }),
      ...(data.logo        !== undefined && { logo: data.logo }),
      ...(data.coverImage  !== undefined && { coverImage: data.coverImage }),
      ...(data.zoneName    !== undefined && { zoneName: data.zoneName }),
      ...(data.isOpen      !== undefined && { isOpen: data.isOpen }),
      ...(data.openTime    !== undefined && { openTime: data.openTime }),
      ...(data.closeTime   !== undefined && { closeTime: data.closeTime }),
      ...(data.workDays    !== undefined && { workDays: data.workDays }),
      ...(data.whatsapp    !== undefined && { whatsapp: data.whatsapp }),
      ...(data.instagram   !== undefined && { instagram: data.instagram }),
      ...(data.website     !== undefined && { website: data.website }),
    },
    select: { id: true, name: true, isOpen: true, businessPlan: true },
  });
};

export const getBusinessById = async (businessId) => {
  const business = await prisma.business.findFirst({
    where: { id: businessId },
    select: {
      id: true, name: true, description: true, category: true,
      logo: true, coverImage: true, lat: true, lng: true,
      zoneName: true, verified: true, isOpen: true, businessPlan: true,
      whatsapp: true, instagram: true, website: true, ownerId: true,
      owner: { select: { id: true, username: true } },
      products: { where: { isActive: true }, select: { id: true, name: true, price: true, imageUrl: true, stock: true, category: true, section: true, description: true, discount: true, isAvailable: true, preparationTime: true, tags: true, variants: { select: { id: true, type: true, label: true, extraPrice: true, stock: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!business) throw new Error("Negocio no encontrado");

  await prisma.business.update({ where: { id: businessId }, data: { totalViews: { increment: 1 } } });

  return business;
};

export const getNearbyBusinesses = async ({ lat, lng, category } = {}) => {
  const where = category ? { category } : {};
  return prisma.business.findMany({
    where,
    select: {
      id: true, name: true, category: true, lat: true, lng: true,
      zoneName: true, verified: true, isOpen: true, businessPlan: true,
      logo: true, description: true,
      owner: { select: { id: true, username: true } },
      _count: { select: { products: true } },
    },
    orderBy: [{ verified: "desc" }, { totalViews: "desc" }],
  });
};

export const toggleBusinessOpen = async (ownerId) => {
  const business = await prisma.business.findFirst({ where: { ownerId } });
  if (!business) throw new Error("Negocio no encontrado");

  return prisma.business.update({
    where: { id: business.id },
    data: { isOpen: !business.isOpen },
    select: { id: true, isOpen: true, name: true },
  });
};
