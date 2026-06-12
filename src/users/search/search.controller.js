import { searchUsers } from "./search.service.js";

export const usersSearch = async (req, res) => {
  try {
    const query = req.query.q || "";

    const users = await searchUsers({
      query,
      currentUserId: req.user.id,
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};