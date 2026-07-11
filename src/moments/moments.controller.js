import { createMoment, getMoments, toggleSaveMoment, getSavedMoments, getLikedMoments } from "./moments.service.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";
import { io } from "../server.js";

// POST /moments/:id/save — guardar / quitar (toggle)
export const save = async (req, res) => {
  try {
    const result = await toggleSaveMoment({ userId: req.user.id, momentId: req.params.id });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /moments/saved
export const saved = async (req, res) => {
  try {
    res.json(await getSavedMoments(req.user.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /moments/liked
export const liked = async (req, res) => {
  try {
    res.json(await getLikedMoments(req.user.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { content, imageUrl, location, duration, lat, lng, locationMode } = req.body;
    if (!content || content.trim().length < 2)
      return res.status(400).json({ message: "El moment necesita contenido" });

    const expiresAt =
      duration === "1h"  ? new Date(Date.now() + 60 * 60 * 1000) :
      duration === "24h" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const moment = await createMoment({ userId: req.user.id, content, imageUrl, location, expiresAt, lat, lng, locationMode });
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

export const uploadMomentImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se recibió ninguna imagen" });

    const result = await uploadToCloudinary(req.file.buffer, "moments", {
      transformation: [
        { width: 1080, height: 1080, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
