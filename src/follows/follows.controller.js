import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "./follows.service.js";

export const followUserController = async (req, res) => {
  try {
    const { followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({ message: "followingId es obligatorio" });
    }

    const follow = await followUser({
      followerId: req.user.id,
      followingId,
    });

    res.status(201).json(follow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const unfollowUserController = async (req, res) => {
  try {
    const { followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({ message: "followingId es obligatorio" });
    }

    const result = await unfollowUser({
      followerId: req.user.id,
      followingId,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const followersController = async (req, res) => {
  try {
    const followers = await getFollowers(req.params.userId);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followingController = async (req, res) => {
  try {
    const following = await getFollowing(req.params.userId);
    res.json(following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};