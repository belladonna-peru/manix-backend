import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { update, active, share, changeMode } from "./location.controller.js";

const router = Router();
router.post("/update",       authMiddleware, update);
router.get("/active-users",  authMiddleware, active);
router.post("/share",        authMiddleware, share);
router.patch("/mode",        authMiddleware, changeMode);
router.patch("/live", authMiddleware, update); // ← agregar esta línea
export default router;
