import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { create, feed, uploadMomentImage } from "./moments.controller.js";

const router = Router();

router.get("/",            authMiddleware, feed);
router.post("/",           authMiddleware, create);
router.post("/upload",     authMiddleware, upload.single("image"), uploadMomentImage);

export default router;
