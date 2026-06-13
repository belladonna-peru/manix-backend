import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { saveToken } from "./notifications.controller.js";

const router = Router();

router.post("/token", authMiddleware, saveToken);

export default router;
