import {
  updateUserVibe,
  updateUserBio,
  updateAccountMode,
  getPublicUserProfile,
  updateUserAvatar,
} from "./users.service.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";

export const updateVibe = async (req, res) => {
  try {
    const { vibe } = req.body;
    if (!vibe) return res.status(400).json({ message: "La vibe es obligatoria" });
    const user = await updateUserVibe({ userId: req.user.id, vibe });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await updateUserBio({ userId: req.user.id, bio: bio || "" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccountModeController = async (req, res) => {
  try {
    const { accountType } = req.body;
    const user = await updateAccountMode({ userId: req.user.id, accountType });
    res.json({ message: "Tipo de cuenta actualizado", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPublicProfileController = async (req, res) => {
  try {
    const user = await getPublicUserProfile(req.params.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se recibió ninguna imagen" });

    const result = await uploadToCloudinary(req.file.buffer, "avatars", {
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    const user = await updateUserAvatar({ userId: req.user.id, avatar: result.secure_url });
    res.json({ avatar: result.secure_url, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
