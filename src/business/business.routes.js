import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { create, update, mine, getById, nearby, toggleOpen } from "./business.controller.js";

const router = Router();
router.post("/",          authMiddleware, create);
router.patch("/",         authMiddleware, update);
router.get("/mine",       authMiddleware, mine);
router.patch("/toggle",   authMiddleware, toggleOpen);
router.get("/nearby",     authMiddleware, nearby);
router.get("/:id",        authMiddleware, getById);
export default router;
