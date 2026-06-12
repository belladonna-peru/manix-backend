import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { usersSearch } from "./search.controller.js";

const router = Router();

router.get("/", authMiddleware, usersSearch);

export default router;