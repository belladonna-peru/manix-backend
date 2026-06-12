import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  openConversation,
  conversationsList,
  messagesList,
  sendMessage,
} from "./chats.controller.js";

const router = Router();

router.post("/open", authMiddleware, openConversation);
router.get("/", authMiddleware, conversationsList);
router.get("/:conversationId/messages", authMiddleware, messagesList);
router.post("/:conversationId/messages", authMiddleware, sendMessage);

export default router;