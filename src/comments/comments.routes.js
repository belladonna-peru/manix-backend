import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  create,
  getByMoment,
} from "./comments.controller.js";

const router = Router();

router.post("/", authMiddleware, create);

router.get(
  "/:momentId",
  authMiddleware,
  getByMoment
);

export default router;