const express = require("express");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Project tasks
router.get("/project/:projectId", getTasks);
router.post("/project/:projectId", createTask);

// Individual task
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// Change status
router.patch("/:id/status", updateTaskStatus);

module.exports = router;