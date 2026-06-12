import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  updateVibe,
  updateBio,
  updateAccountModeController,
  getPublicProfileController,
} from "./users.controller.js";

const router = Router();

router.patch("/vibe", authMiddleware, updateVibe);
router.patch("/bio", authMiddleware, updateBio);
router.patch("/account-mode", authMiddleware, updateAccountModeController);
router.get("/:userId", authMiddleware, getPublicProfileController);

export default router;