const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/notification");
// GET all tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
  _id: projectId,
  $or: [
    { owner: req.user.id },
    { members: req.user.id },
  ],
});

if (!project) {
  return res.status(403).json({
    message: "You are not allowed to access this project's tasks",
  });
}

const tasks = await Task.find({ project: projectId })
      .populate("assignee", "name email")
      .populate("creator", "name email")
      .sort({ position: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};
// GET single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

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
        message: "You are not allowed to access this task",
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("creator", "name email")
      .populate("project", "name");

    res.json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
};




// CREATE task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // Make sure project exists
    const project = await Project.findOne({
  _id: projectId,
  $or: [
    { owner: req.user.id },
    { members: req.user.id },
  ],
});

if (!project) {
  return res.status(403).json({
    message: "You are not allowed to create tasks in this project",
  });
}
if (assignee) {
  const isProjectMember = project.members.some(
    (member) => member.toString() === assignee
  );

  if (!isProjectMember && project.owner.toString() !== assignee) {
    return res.status(400).json({
      message: "Assignee must be a member of this project",
    });
  }
}

    const task = await Task.create({
      project: projectId,
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      assignee: assignee || null,
      creator: req.user.id,
      dueDate: dueDate || null,
    });
    if (assignee) {
  await Notification.create({
    recipient: assignee,
    type: "taskAssigned",
    title: "New task assigned",
    message: `You have been assigned the task "${task.title}"`,
    task: task._id,
    project: project._id,
  });
}

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("creator", "name email");

    res.status(201).json(populatedTask);
  } catch (error) {
  console.error("CREATE TASK ERROR:", error);

  res.status(500).json({
    message: error.message,
  });
}
};


// UPDATE task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

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
        message: "You are not allowed to update this task",
      });
    }
    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
    } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    if (assignee !== undefined) {
  if (assignee) {
    const isProjectMember = project.members.some(
      (member) => member.toString() === assignee
    );

    if (!isProjectMember && project.owner.toString() !== assignee) {
      return res.status(400).json({
        message: "Assignee must be a member of this project",
      });
    }
  }

  const previousAssignee = task.assignee
    ? task.assignee.toString()
    : null;

  task.assignee = assignee || null;

  if (assignee && assignee !== previousAssignee) {
    await Notification.create({
      recipient: assignee,
      type: "taskAssigned",
      title: "New task assigned",
      message: `You have been assigned the task "${task.title}"`,
      task: task._id,
      project: project._id,
    });
  }
}
    task.dueDate = dueDate ?? task.dueDate;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("creator", "name email");

    res.json(updatedTask);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
};

// DELETE task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

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
        message: "You are not allowed to delete this task",
      });
    }

    await task.deleteOne();

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
};


// CHANGE STATUS
// CHANGE STATUS
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

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
        message: "You are not allowed to change this task",
      });
    }

    const { status } = req.body;

    task.status = status;

    await task.save();

    res.json(task);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};