import {
  updateLocation,
  getActiveUsers,
  shareLocationWithFriend,
  getMyShares,
  updateLocationMode,
} from "./location.service.js";

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
    const { friendId, share: doShare, duration } = req.body;
    const result = await shareLocationWithFriend({
      ownerId: req.user.id,
      friendId,
      share: doShare,
      duration, // "15m" | "1h" | "8h" | "always" (default en el service)
    });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

// GET /location/shares — con quién comparto + quién comparte conmigo
export const myShares = async (req, res) => {
  try {
    const result = await getMyShares(req.user.id);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const changeMode = async (req, res) => {
  try {
    const result = await updateLocationMode({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};