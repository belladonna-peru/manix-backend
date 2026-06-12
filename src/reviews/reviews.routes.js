import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { create, forBusiness, reply } from "./reviews.controller.js";
const router = Router();
router.post("/",                    authMiddleware, create);
router.get("/business/:businessId", authMiddleware, forBusiness);
router.patch("/:id/reply",          authMiddleware, reply);
export default router;
