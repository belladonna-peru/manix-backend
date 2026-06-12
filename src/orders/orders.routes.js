import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { place, myOrders, businessOrders, updateStatus } from "./orders.controller.js";

const router = Router();
router.post("/",              authMiddleware, place);
router.get("/mine",           authMiddleware, myOrders);
router.get("/business",       authMiddleware, businessOrders);
router.patch("/:id/status",   authMiddleware, updateStatus);
export default router;
