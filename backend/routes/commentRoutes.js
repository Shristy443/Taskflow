const express = require("express");

const {
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All comment routes require login
router.use(protect);

// Get all comments for a task
router.get("/task/:taskId", getComments);

// Create a comment for a task
router.post("/task/:taskId", createComment);

// Delete a comment
router.delete("/:id", deleteComment);

module.exports = router;