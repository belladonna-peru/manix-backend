import { createOrder, getMyOrders, getBusinessOrders, updateOrderStatus } from "./orders.service.js";
import { getMyBusiness } from "../business/business.service.js";

export const place = async (req, res) => {
  try {
    const { items, notes } = req.body;
    const { businessId } = req.body;
    const order = await createOrder({ buyerId: req.user.id, businessId, items, notes });

    // Emitir al socket del negocio si está disponible
    if (req.io) {
      req.io.to(`business:${businessId}`).emit("order:new", order);
    }

    res.status(201).json(order);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const myOrders = async (req, res) => {
  try {
    const orders = await getMyOrders(req.user.id);
    res.json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const businessOrders = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.json([]);
    const orders = await getBusinessOrders(business.id);
    res.json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateStatus = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(403).json({ message: "No autorizado" });
    const order = await updateOrderStatus({ orderId: req.params.id, businessId: business.id, status: req.body.status });

    if (req.io) {
      req.io.to(`user:${order.buyer.id}`).emit("order:updated", order);
    }

    res.json(order);
  } catch (error) { res.status(400).json({ message: error.message }); }
};
