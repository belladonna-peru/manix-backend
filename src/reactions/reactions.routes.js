import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { create } from "./reactions.controller.js";

const router = Router();

router.post("/", authMiddleware, create);

export default router;