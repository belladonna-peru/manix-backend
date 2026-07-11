import {
  createReel,
  getReels,
  toggleReelLike,
  addReelView,
} from "./reels.service.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";

// POST /reels/upload — sube el video a Cloudinary (resource_type video)
export const uploadReelVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se recibió el video" });
    const result = await uploadToCloudinary(req.file.buffer, "reels", {
      resource_type: "video",
    });
    res.status(201).json({
      url: result.secure_url,
      duration: Math.round(result.duration || 0),
      // thumbnail automático de Cloudinary (primer frame como .jpg)
      thumbnailUrl: result.secure_url.replace(/\.(mp4|mov|webm|m4v)$/i, ".jpg"),
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "No se pudo subir el video" });
  }
};

// POST /reels — crea el reel
export const create = async (req, res) => {
  try {
    const reel = await createReel({ userId: req.user.id, ...req.body });
    res.status(201).json(reel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /reels?filter=para_ti|siguiendo|negocios|streams
export const feed = async (req, res) => {
  try {
    const reels = await getReels({ userId: req.user.id, filter: req.query.filter });
    res.json(reels);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /reels/:id/like
export const like = async (req, res) => {
  try {
    const result = await toggleReelLike({ reelId: req.params.id, userId: req.user.id });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /reels/:id/view
export const view = async (req, res) => {
  try {
    await addReelView(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
