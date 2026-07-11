import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadAudio } from "../middleware/upload.middleware.js";
import {
  openConversation,
  conversationsList,
  messagesList,
  sendMessage,
  uploadChatAudio,
  reactMessage,
  removeMessage,
} from "./chats.controller.js";

const router = Router();

router.post("/open", authMiddleware, openConversation);
router.get("/", authMiddleware, conversationsList);
router.get("/:conversationId/messages", authMiddleware, messagesList);
router.post("/:conversationId/messages", authMiddleware, sendMessage);
router.post("/upload-audio", authMiddleware, uploadAudio.single("audio"), uploadChatAudio);
router.post("/messages/:id/react", authMiddleware, reactMessage);
router.delete("/messages/:id", authMiddleware, removeMessage);

export default router;