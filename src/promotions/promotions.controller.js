import { createPromotion, getBusinessPromotions, getActivePromotions, togglePromotion, deletePromotion, validateCoupon } from "./promotions.service.js";
import { getMyBusiness } from "../business/business.service.js";

export const create = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(404).json({ message: "Negocio no encontrado" });
    const promo = await createPromotion({ businessId: business.id, ...req.body });
    res.status(201).json(promo);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const mine = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.json([]);
    const promos = await getBusinessPromotions(business.id);
    res.json(promos);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const active = async (req, res) => {
  try {
    const promos = await getActivePromotions(req.params.businessId);
    res.json(promos);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const toggle = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(403).json({ message: "No autorizado" });
    const promo = await togglePromotion({ promotionId: req.params.id, businessId: business.id });
    res.json(promo);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const remove = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(403).json({ message: "No autorizado" });
    await deletePromotion({ promotionId: req.params.id, businessId: business.id });
    res.json({ message: "Promoción eliminada" });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const validate = async (req, res) => {
  try {
    const { code, businessId, orderTotal } = req.body;
    const promo = await validateCoupon({ code, businessId, orderTotal: parseFloat(orderTotal) });
    res.json(promo);
  } catch (e) { res.status(400).json({ message: e.message }); }
};
