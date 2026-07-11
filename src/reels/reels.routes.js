import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadVideo } from "../middleware/upload.middleware.js";
import { uploadReelVideo, create, feed, like, view } from "./reels.controller.js";

const router = Router();

router.get("/", authMiddleware, feed);
router.post("/", authMiddleware, create);
router.post("/upload", authMiddleware, uploadVideo.single("video"), uploadReelVideo);
router.post("/:id/like", authMiddleware, like);
router.post("/:id/view", authMiddleware, view);

export default router;
