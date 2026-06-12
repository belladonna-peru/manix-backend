import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { create, feed } from "./moments.controller.js";

const router = Router();

router.get("/", authMiddleware, feed);
router.post("/", authMiddleware, create);

export default router;