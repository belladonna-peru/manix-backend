import { createBusiness, updateBusiness, getMyBusiness, getBusinessById, getNearbyBusinesses, toggleBusinessOpen } from "./business.service.js";

export const create = async (req, res) => {
  try {
    const business = await createBusiness({ ownerId: req.user.id, ...req.body });
    if (req.io) req.io.emit("business:new", business);
    res.status(201).json(business);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const update = async (req, res) => {
  try {
    const business = await updateBusiness({ ownerId: req.user.id, ...req.body });
    if (req.io) req.io.emit("business:updated", { id: business.id, isOpen: business.isOpen });
    res.json(business);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const mine = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(404).json({ message: "Sin negocio registrado" });
    res.json(business);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getById = async (req, res) => {
  try {
    const business = await getBusinessById(req.params.id);
    res.json(business);
  } catch (error) { res.status(404).json({ message: error.message }); }
};

export const nearby = async (req, res) => {
  try {
    const { lat, lng, category } = req.query;
    const businesses = await getNearbyBusinesses({ lat, lng, category });
    res.json(businesses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const toggleOpen = async (req, res) => {
  try {
    const result = await toggleBusinessOpen(req.user.id);
    if (req.io) req.io.emit("business:status", result);
    res.json(result);
  } catch (error) { res.status(400).json({ message: error.message }); }
};
