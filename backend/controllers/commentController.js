const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
// GET comments for a task
const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not allowed to access these comments",
      });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
};

// CREATE comment
const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not allowed to comment on this task",
      });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user.id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to create comment",
    });
  }
};

// DELETE comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const task = await Task.findById(comment.task);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment",
      });
    }

    await comment.deleteOne();

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
};