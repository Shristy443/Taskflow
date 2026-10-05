const express = require("express");

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
   addMember,
  removeMember,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All project routes require login
router.use(protect);

router.get("/", getProjects);

router.get("/:id", getProject);

router.post("/", createProject);

router.put("/:id", updateProject);

router.delete("/:id", deleteProject);

router.post("/:id/members", addMember);
router.delete("/:id/members", removeMember);

module.exports = router;