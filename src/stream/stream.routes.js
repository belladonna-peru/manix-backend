import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { start, end, live, stats, addEvent, myEvents, removeEvent } from "./stream.controller.js";

const router = Router();
router.post("/start",        authMiddleware, start);
router.post("/end",          authMiddleware, end);
router.get("/live",          authMiddleware, live);
router.get("/stats",         authMiddleware, stats);
router.post("/events",       authMiddleware, addEvent);
router.get("/events",        authMiddleware, myEvents);
router.delete("/events/:id", authMiddleware, removeEvent);
export default router;
