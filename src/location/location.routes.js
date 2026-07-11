import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { update, active, share, myShares, changeMode, requestLocation, incomingRequests, respondRequest } from "./location.controller.js";

const router = Router();
router.post("/update",       authMiddleware, update);
router.patch("/live",        authMiddleware, update);   // ← ubicación en vivo (app + background)
router.get("/active-users",  authMiddleware, active);
router.post("/share",        authMiddleware, share);    // body: { friendId, share, duration }
router.get("/shares",        authMiddleware, myShares); // ← restaurar switches + "comparten contigo"
router.patch("/mode",        authMiddleware, changeMode);
// ── Solicitudes de ubicación (estilo inDrive) ──
router.post("/request",           authMiddleware, requestLocation);   // { toUserId }
router.get("/requests",           authMiddleware, incomingRequests);
router.post("/request/:id/respond", authMiddleware, respondRequest);  // { accept, duration }
export default router;