import { updateLocation, getActiveUsers, shareLocationWithFriend, updateLocationMode } from "./location.service.js";

export const update = async (req, res) => {
  try {
    const result = await updateLocation({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const active = async (req, res) => {
  try {
    const users = await getActiveUsers(req.user.id);
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const share = async (req, res) => {
  try {
    const { friendId, share: doShare } = req.body;
    const result = await shareLocationWithFriend({ ownerId: req.user.id, friendId, share: doShare });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const changeMode = async (req, res) => {
  try {
    const result = await updateLocationMode({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};
