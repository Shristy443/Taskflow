const User = require("../models/User");

// GET all users
const Workspace = require("../models/Workspace");

// GET users in current user's workspace
const getUsers = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
  $or: [
    { owner: req.user.id },
    { members: req.user.id },
  ],
});

    if (!workspace) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $in: workspace.members },
    })
      .select("name email role")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
// SEARCH users to add to workspace/project
const searchUsers = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
  owner: req.user.id,
});

if (!workspace) {
  return res.status(403).json({
    message: "Only the workspace owner can search users",
  });
}
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ],
    })
      .select("name email role")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    res.status(500).json({
      message: "Failed to search users",
    });
  }
};

module.exports = {
  getUsers,
    searchUsers,
};