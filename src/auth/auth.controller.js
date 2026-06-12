import { registerUser, loginUser, getMe } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) { res.status(401).json({ message: error.message }); }
};

export const me = async (req, res) => {
  try {
    const user = await getMe(req.user.id);
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
