import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { create, feed, uploadMomentImage, save, saved, liked } from "./moments.controller.js";

const router = Router();

router.get("/",            authMiddleware, feed);
router.get("/saved",       authMiddleware, saved);
router.get("/liked",       authMiddleware, liked);
router.post("/",           authMiddleware, create);
router.post("/upload",     authMiddleware, upload.single("image"), uploadMomentImage);
router.post("/:id/save",   authMiddleware, save);

export default router;
