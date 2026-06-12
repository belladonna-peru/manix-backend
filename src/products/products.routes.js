import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { create, update, remove, myProducts, publicCatalog } from "./products.controller.js";

const router = Router();
router.get("/mine",                    authMiddleware, myProducts);
router.post("/",                       authMiddleware, create);
router.patch("/:id",                   authMiddleware, update);
router.delete("/:id",                  authMiddleware, remove);
router.get("/catalog/:businessId",     authMiddleware, publicCatalog);
export default router;