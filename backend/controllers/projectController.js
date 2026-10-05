const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Workspace = require("../models/Workspace");
// GET all projects
exports.getProjects = async (req, res) => {
  try {
   const projects = await Project.find({
  $or: [
    { owner: req.user.id },
    { members: req.user.id },
  ],
})
      .populate("owner", "name email")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// GET single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
  _id: req.params.id,
  $or: [
    { owner: req.user.id },
    { members: req.user.id },
  ],
})
  .populate("owner", "name email")
  .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// CREATE project
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      dueDate,
      owner: req.user.id,
      members: [req.user.id],
    });

    const populatedProject = await Project.findById(
      project._id
    )
      .populate("owner", "name email")
      .populate("members", "name email role");

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// UPDATE project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this project",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("owner", "name email")
      .populate("members", "name email role");

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// DELETE project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this project",
      });
    }

    // Find all tasks belonging to this project
    const projectTasks = await Task.find({
      project: project._id,
    }).select("_id");

    const taskIds = projectTasks.map((task) => task._id);

    // Delete comments belonging to those tasks
    if (taskIds.length > 0) {
      await Comment.deleteMany({
        task: { $in: taskIds },
      });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({
      project: project._id,
    });

    // Delete the project itself
    await project.deleteOne();

    res.json({
      message: "Project and related data deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// ADD MEMBER TO PROJECT
exports.addMember = async (req, res) => {
  try {
    const { userId, department } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only project owner can manage members
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the project owner can manage members",
      });
    }

    // Prevent duplicate members
    if (project.members.some((member) => member.toString() === userId)) {
      return res.status(400).json({
        message: "User is already a project member",
      });
    }

    const User = require("../models/User");

await User.findByIdAndUpdate(userId, {
  department: department || "Engineering",
});

    project.members.push(userId);
await project.save();

// Add the user to the project owner's workspace
const workspace = await Workspace.findOne({
  owner: req.user.id,
});

if (workspace && !workspace.members.some(
  (member) => member.toString() === userId
)) {
  workspace.members.push(userId);
  await workspace.save();
}

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email role department");

    res.json(updatedProject);
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);

    res.status(500).json({
      message: "Failed to add member",
    });
  }
};


// REMOVE MEMBER FROM PROJECT
exports.removeMember = async (req, res) => {
  try {
    const { userId, department } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only project owner can manage members
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the project owner can manage members",
      });
    }

    // Owner cannot remove themselves
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        message: "Project owner cannot be removed",
      });
    }

    project.members = project.members.filter(
      (member) => member.toString() !== userId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email role");

    res.json(updatedProject);
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);

    res.status(500).json({
      message: "Failed to remove member",
    });
  }
};