import prisma from "../config/prisma.js";

const productSelect = {
  id: true, name: true, description: true,
  price: true, imageUrl: true, category: true, section: true,
  isActive: true, isAvailable: true, stock: true, createdAt: true,
  discount: true, discountEndsAt: true, preparationTime: true, tags: true,
  variants: true,
};

export const createProduct = async ({ businessId, name, description, price, imageUrl, category, stock, section, discount, preparationTime, tags, variants }) => {
  return prisma.product.create({
    data: {
      businessId, name, description,
      price: parseFloat(price),
      imageUrl, category,
      stock: parseInt(stock) || 0,
      section: section || null,
      discount: discount ? parseFloat(discount) : null,
      preparationTime: preparationTime ? parseInt(preparationTime) : null,
      tags: tags || null,
      variants: variants?.length
        ? { create: variants.map((v) => ({ type: v.type, label: v.label, extraPrice: parseFloat(v.extraPrice) || 0, stock: parseInt(v.stock) || 0 })) }
        : undefined,
    },
    include: { variants: true },
  });
};

export const updateProduct = async ({ productId, businessId, ...data }) => {
  const product = await prisma.product.findFirst({ where: { id: productId, businessId } });
  if (!product) throw new Error("Producto no encontrado");

  return prisma.product.update({
    where: { id: productId },
    data: {
      ...( data.name        && { name: data.name }),
      ...( data.description !== undefined && { description: data.description }),
      ...( data.price       && { price: parseFloat(data.price) }),
      ...( data.imageUrl    !== undefined && { imageUrl: data.imageUrl }),
      ...( data.category    && { category: data.category }),
      ...( data.stock       !== undefined && { stock: parseInt(data.stock) }),
      ...( data.isActive    !== undefined && { isActive: data.isActive }),
    },
    include: { variants: true },
  });
};

export const deleteProduct = async ({ productId, businessId }) => {
  const product = await prisma.product.findFirst({ where: { id: productId, businessId } });
  if (!product) throw new Error("Producto no encontrado");
  return prisma.product.delete({ where: { id: productId } });
};

export const getBusinessProducts = async (businessId) => {
  return prisma.product.findMany({
    where: { businessId },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getPublicCatalog = async (businessId) => {
  return prisma.product.findMany({
    where: { businessId, isActive: true },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
};

// ─── Validar límite de plan antes de crear ────────────────────────────────────

const PLAN_LIMITS = { basic: 20, pro: 50, premium: Infinity };

export const validateProductLimit = async (businessId) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { owner: { select: { businessPlan: true } }, _count: { select: { products: true } } },
  });

  if (!business) throw new Error("Negocio no encontrado");

  const plan  = business.owner?.businessPlan || "basic";
  const limit = PLAN_LIMITS[plan] || 20;
  const count = business._count.products;

  if (count >= limit) {
    throw new Error(`Has alcanzado el límite de ${limit} productos del plan ${plan}. Mejora tu plan para agregar más.`);
  }

  return true;
};
