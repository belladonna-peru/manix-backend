import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  followUserController,
  unfollowUserController,
  followersController,
  followingController,
} from "./follows.controller.js";

const router = Router();

router.post("/follow", authMiddleware, followUserController);
router.post("/unfollow", authMiddleware, unfollowUserController);
router.get("/:userId/followers", authMiddleware, followersController);
router.get("/:userId/following", authMiddleware, followingController);

export default router;