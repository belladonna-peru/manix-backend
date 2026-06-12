import {
  createComment,
  getCommentsByMoment,
} from "./comments.service.js";

export const create = async (req, res) => {
  try {

    const { momentId, content } = req.body;

    if (!momentId || !content) {
      return res.status(400).json({
        message: "momentId y content son obligatorios",
      });
    }

    const comment = await createComment({
      userId: req.user.id,
      momentId,
      content,
    });

    res.status(201).json(comment);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

export const getByMoment = async (req, res) => {
  try {

    const comments = await getCommentsByMoment(
      req.params.momentId
    );

    res.json(comments);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};