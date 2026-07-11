import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { myWallet, recharge, pay, donate, redeem, send } from "./wallet.controller.js";

const router = Router();
router.get("/",          authMiddleware, myWallet);
router.post("/recharge", authMiddleware, recharge);
router.post("/pay",      authMiddleware, pay);
router.post("/donate",   authMiddleware, donate);
router.post("/redeem",   authMiddleware, redeem);
router.post("/send",     authMiddleware, send);
export default router;
