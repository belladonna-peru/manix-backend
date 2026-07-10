import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { update, active, share, myShares, changeMode } from "./location.controller.js";

const router = Router();
router.post("/update",       authMiddleware, update);
router.patch("/live",        authMiddleware, update);   // ← ubicación en vivo (app + background)
router.get("/active-users",  authMiddleware, active);
router.post("/share",        authMiddleware, share);    // body: { friendId, share, duration }
router.get("/shares",        authMiddleware, myShares); // ← NUEVO: restaurar switches + "comparten contigo"
router.patch("/mode",        authMiddleware, changeMode);
export default router;