import {
  sendFriendRequest,
  getReceivedRequests,
  acceptFriendRequest,
  getFriends,
} from "./friends.service.js";
import {
  notifyFriendRequest,
  notifyFriendAccepted,
} from "../notifications/notifications.service.js";
import prisma from "../config/prisma.js";

export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: "receiverId es obligatorio" });

    const request = await sendFriendRequest({ senderId: req.user.id, receiverId });
    res.status(201).json(request);

    // Notificar al receptor (sin bloquear la respuesta)
    notifyFriendRequest({
      senderId:        req.user.id,
      receiverId,
      senderUsername:  req.user.username,
    }).catch(() => {});

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const receivedRequests = async (req, res) => {
  try {
    const requests = await getReceivedRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    // Obtener la solicitud antes de aceptar para saber quién la envió
    const friendRequest = await prisma.friendRequest.findFirst({
      where: { id: req.params.requestId.trim() },
    });

    const friendship = await acceptFriendRequest({
      requestId: req.params.requestId,
      userId:    req.user.id,
    });

    res.json(friendship);

    // Notificar al que envió la solicitud
    if (friendRequest) {
      notifyFriendAccepted({
        acceptorId:       req.user.id,
        requesterId:      friendRequest.senderId,
        acceptorUsername: req.user.username,
      }).catch(() => {});
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const friendsList = async (req, res) => {
  try {
    const friends = await getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
