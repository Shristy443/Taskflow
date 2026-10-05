const express = require("express");

const {
  getWorkspace,
  updateWorkspace,
} = require("../controllers/workspaceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All workspace routes require authentication
router.use(protect);

// Get current user's workspace
router.get("/", getWorkspace);

// Update current user's workspace
router.put("/", updateWorkspace);

module.exports = router;