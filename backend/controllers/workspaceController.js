const Workspace = require("../models/Workspace");

// GET workspace
const getWorkspace = async (req, res) => {
  try {
    let workspace = await Workspace.findOne({
      owner: req.user.id,
    }).populate("members", "name email role");

    // Create default workspace if user doesn't have one
    if (!workspace) {
      workspace = await Workspace.create({
        name: "TaskFlow Workspace",
        url: `taskflow-${req.user.id}`,
        description:
          "A collaborative workspace for managing projects and tasks.",
        owner: req.user.id,
        members: [req.user.id],
      });

      workspace = await Workspace.findById(workspace._id).populate(
        "members",
        "name email role"
      );
    }

    res.json(workspace);
  } catch (error) {
    console.error("GET WORKSPACE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch workspace",
    });
  }
};

// UPDATE workspace
const updateWorkspace = async (req, res) => {
  try {
    const { name, url, description } = req.body;

    const workspace = await Workspace.findOne({
      owner: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    workspace.name = name;
    workspace.url = url;
    workspace.description = description;

    await workspace.save();

    res.json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    console.error("UPDATE WORKSPACE ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Workspace URL already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update workspace",
    });
  }
};

module.exports = {
  getWorkspace,
  updateWorkspace,
};