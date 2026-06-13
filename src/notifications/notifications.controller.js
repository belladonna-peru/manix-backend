import { savePushToken } from "./notifications.service.js";

export const saveToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) return res.status(400).json({ message: "Token requerido" });
    const result = await savePushToken({ userId: req.user.id, pushToken });
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
