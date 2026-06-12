import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  sendRequest,
  receivedRequests,
  acceptRequest,
  friendsList,
} from "./friends.controller.js";

const router = Router();

router.post("/request", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, receivedRequests);
router.post("/accept/:requestId", authMiddleware, acceptRequest);
router.get("/", authMiddleware, friendsList);

export default router;