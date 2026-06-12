import {
  sendFriendRequest,
  getReceivedRequests,
  acceptFriendRequest,
  getFriends,
} from "./friends.service.js";

export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId es obligatorio" });
    }

    const request = await sendFriendRequest({
      senderId: req.user.id,
      receiverId,
    });

    res.status(201).json(request);
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
    const friendship = await acceptFriendRequest({
      requestId: req.params.requestId,
      userId: req.user.id,
    });

    res.json(friendship);
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