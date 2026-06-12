import {
  updateUserVibe,
  updateUserBio,
  updateAccountMode,
  getPublicUserProfile,
} from "./users.service.js";

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
