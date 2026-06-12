import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  createMessage,
} from "./chats.service.js";

export const openConversation = async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ message: "friendId es obligatorio" });
    }

    const conversation = await getOrCreateConversation({
      userId: req.user.id,
      friendId,
    });

    res.json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const conversationsList = async (req, res) => {
  try {
    const conversations = await getConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const messagesList = async (req, res) => {
  try {
    const messages = await getMessages({
      conversationId: req.params.conversationId,
      userId: req.user.id,
    });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const message = await createMessage({
      conversationId: req.params.conversationId,
      senderId: req.user.id,
      content: req.body.content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};