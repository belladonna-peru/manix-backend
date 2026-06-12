import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { listAlerts } from "./alerts.controller.js";

const router = Router();

router.get("/", authMiddleware, listAlerts);

export default router;