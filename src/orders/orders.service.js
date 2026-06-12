import prisma from "../config/prisma.js";

export const createOrder = async ({ buyerId, businessId, items, notes }) => {
  if (!items?.length) throw new Error("El carrito está vacío");

  // Calcular total y verificar stock
  let total = 0;
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });
      if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
      if (!product.isActive) throw new Error(`Producto no disponible: ${product.name}`);

      let unitPrice = product.price;
      let variantLabel = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPrice += variant.extraPrice;
          variantLabel = variant.label;
        }
      }

      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        variantLabel,
      };
    })
  );

  return prisma.order.create({
    data: {
      buyerId, businessId, notes,
      total: Math.round(total * 100) / 100,
      status: "pending",
      items: { create: enrichedItems },
    },
    include: {
      items: { include: { product: true } },
      buyer: { select: { id: true, username: true, vibe: true } },
      business: { select: { id: true, name: true } },
    },
  });
};

export const getMyOrders = async (buyerId) => {
  return prisma.order.findMany({
    where: { buyerId },
    include: {
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
      business: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getBusinessOrders = async (businessId) => {
  return prisma.order.findMany({
    where: { businessId },
    include: {
      items: { include: { product: { select: { name: true, imageUrl: true, price: true } } } },
      buyer: { select: { id: true, username: true, vibe: true, zoneName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateOrderStatus = async ({ orderId, businessId, status }) => {
  const VALID = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
  if (!VALID.includes(status)) throw new Error("Estado inválido");

  const order = await prisma.order.findFirst({ where: { id: orderId, businessId } });
  if (!order) throw new Error("Pedido no encontrado");

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: { include: { product: { select: { name: true } } } },
      buyer: { select: { id: true, username: true } },
    },
  });
};
