import { createReview, getBusinessReviews, replyReview } from "./reviews.service.js";
import { getMyBusiness } from "../business/business.service.js";

export const create = async (req, res) => {
  try {
    const review = await createReview({ userId: req.user.id, ...req.body });
    res.status(201).json(review);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const forBusiness = async (req, res) => {
  try {
    const data = await getBusinessReviews(req.params.businessId);
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const reply = async (req, res) => {
  try {
    const business = await getMyBusiness(req.user.id);
    if (!business) return res.status(403).json({ message: "No autorizado" });
    const review = await replyReview({ reviewId: req.params.id, businessId: business.id, reply: req.body.reply });
    res.json(review);
  } catch (e) { res.status(400).json({ message: e.message }); }
};
