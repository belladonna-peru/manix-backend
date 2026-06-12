 import { createMoment, getMoments } from "./moments.service.js";
 import { io } from "../server.js";

export const create = async (req, res) => {
  try {
    const { content, imageUrl, location, duration, lat,
lng,
locationMode, } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: "El moment necesita contenido" });
    }

    const expiresAt =
  duration === "1h"
    ? new Date(Date.now() + 60 * 60 * 1000)
    : duration === "24h"
    ? new Date(Date.now() + 24 * 60 * 60 * 1000)
    : null;

    const moment = await createMoment({
      userId: req.user.id,
      content,
      imageUrl,
      location,
      expiresAt,
      lat,
lng,
locationMode,
      
    });
    io.emit("moment:created", moment);

    res.status(201).json(moment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const feed = async (req, res) => {
  try {
    const moments = await getMoments();
    res.json(moments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};