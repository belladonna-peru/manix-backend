import { createProduct, updateProduct, deleteProduct, getBusinessProducts, getPublicCatalog, validateProductLimit } from "./products.service.js";
import { getMyBusiness } from "../business/business.service.js";

export const create = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(404).json({ message: "No tienes un negocio registrado" });
    await validateProductLimit(business.id);
    const product = await createProduct({ businessId: business.id, ...req.body });
    res.status(201).json(product);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const update = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(404).json({ message: "Negocio no encontrado" });
    const product = await updateProduct({ productId: req.params.id, businessId: business.id, ...req.body });
    res.json(product);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const remove = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(404).json({ message: "Negocio no encontrado" });
    await deleteProduct({ productId: req.params.id, businessId: business.id });
    res.json({ message: "Producto eliminado" });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const myProducts = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.json([]);
    const products = await getBusinessProducts(business.id);
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const publicCatalog = async (req, res) => {
  try {
    const products = await getPublicCatalog(req.params.businessId);
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
