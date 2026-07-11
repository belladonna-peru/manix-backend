import {
  updateLocation,
  getActiveUsers,
  shareLocationWithFriend,
  getMyShares,
  updateLocationMode,
  createLocationRequest,
  getIncomingLocationRequests,
  respondLocationRequest,
} from "./location.service.js";
import { io } from "../server.js";

// POST /location/request { toUserId } — pedir ver la ubicación de alguien
export const requestLocation = async (req, res) => {
  try {
    const result = await createLocationRequest({ fromId: req.user.id, toId: req.body.toUserId });
    // avisar al destinatario en vivo
    try { io.emit("location:request", { toId: req.body.toUserId, fromId: req.user.id }); } catch {}
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /location/requests — solicitudes que me llegaron (pendientes)
export const incomingRequests = async (req, res) => {
  try {
    res.json(await getIncomingLocationRequests(req.user.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /location/request/:id/respond { accept: true|false, duration }
export const respondRequest = async (req, res) => {
  try {
    const result = await respondLocationRequest({
      requestId: req.params.id, userId: req.user.id,
      accept: req.body.accept, duration: req.body.duration,
    });
    if (result.accepted) { try { io.emit("location:granted", { toId: result.fromId, fromId: req.user.id }); } catch {} }
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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