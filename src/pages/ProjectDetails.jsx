
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  FiArrowLeft,
  FiPlus,
  FiMoreHorizontal,
  FiCalendar,
  FiMessageCircle,
  FiPaperclip,
  FiUser,
   FiX,
  FiCheck,
} from "react-icons/fi";



const columns = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];
function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
const countResponses = await Promise.all(
  response.data.map((task) =>
    api.get(`/comments/task/${task._id}`)
  )
);

const counts = {};

response.data.forEach((task, index) => {
  counts[task._id] = countResponses[index].data.length;
});

setCommentCounts(counts);
      const groupedTasks = {
        backlog: [],
        todo: [],
        "in-progress": [],
        "in-review": [],
        done: [],
      };

      response.data.forEach((task) => {
        if (groupedTasks[task.status]) {
          groupedTasks[task.status].push(task);
        }
      });

      setTasks(groupedTasks);
    } catch (error) {
      console.error("FETCH TASKS ERROR:", error);
    }
  };

  fetchTasks();
}, [id]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
    }
  };

  fetchUsers();
}, []);


const [tasks, setTasks] = useState({
  backlog: [],
  todo: [],
  "in-progress": [],
  "in-review": [],
  done: [],
});
  const [draggedTask, setDraggedTask] = useState(null);
const [selectedTask, setSelectedTask] = useState(null);
const [openTaskMenu, setOpenTaskMenu] = useState(null);
const [taskSearch, setTaskSearch] = useState("");
const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
const [taskAssigneeFilter, setTaskAssigneeFilter] = useState("all");
const [showAddTask, setShowAddTask] = useState(false);
const [commentText, setCommentText] = useState("");
const [comments, setComments] = useState([]);
const [commentCounts, setCommentCounts] = useState({});
const [users, setUsers] = useState([]);

const [subtasks, setSubtasks] = useState([
  { id: 1, title: "Create initial design", completed: true },
  { id: 2, title: "Review design with team", completed: false },
  { id: 3, title: "Apply final changes", completed: false },
]);

const [editTask, setEditTask] = useState({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: "",
  dueDate: "",
});
const [newTask, setNewTask] = useState({
  title: "",
  description: "",
  priority: "medium",
  assignee: "",
  dueDate: "",
});
useEffect(() => {
  const fetchComments = async () => {
    if (!selectedTask?._id) return;

    try {
      const response = await api.get(
        `/comments/task/${selectedTask._id}`
      );

      setComments(response.data);
    } catch (error) {
      console.error("FETCH COMMENTS ERROR:", error);
    }
  };

  fetchComments();
}, [selectedTask]);

useEffect(() => {
  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);

      setProject(response.data);
    } catch (error) {
  console.error("FETCH PROJECT ERROR:", error);

  if (error.response?.status === 401 || error.response?.status === 403) {
    navigate("/projects");
    return;
  }

  if (error.response?.status === 404) {
    navigate("/projects");
    return;
  }
}
  };

  fetchProject();
}, [id]);
const [labels, setLabels] = useState([
  "Design",
  "Frontend",
]);

useEffect(() => {
  const handleClickOutside = () => {
    setOpenTaskMenu(null);
  };

  if (openTaskMenu) {
    document.addEventListener("click", handleClickOutside);
  }

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, [openTaskMenu]);


 const [project, setProject] = useState(null);
const [showEditProject, setShowEditProject] = useState(false);
const [showMembers, setShowMembers] = useState(false);
const [selectedMember, setSelectedMember] = useState("");
const [editProject, setEditProject] = useState({
  name: "",
  description: "",
  status: "active",
  priority: "medium",
  dueDate: "",
});
  const handleDragStart = (task, columnId) => {
    setDraggedTask({
      task,
      columnId,
    });
  };

  const handleDrop = async (targetColumn) => {
  if (!draggedTask) return;

  const { task, columnId: sourceColumn } = draggedTask;

  if (sourceColumn === targetColumn) {
    setDraggedTask(null);
    return;
  }

  try {
    // Update status in MongoDB
    const response = await api.patch(
      `/tasks/${task._id}/status`,
      {
        status: targetColumn,
      }
    );

    const updatedTask = response.data;

    // Update UI after backend update succeeds
    setTasks((previous) => {
      const updated = { ...previous };

      updated[sourceColumn] = updated[sourceColumn].filter(
        (item) => item._id !== task._id
      );

      updated[targetColumn] = [
        ...updated[targetColumn],
        updatedTask,
      ];

      return updated;
    });

  } catch (error) {
    console.error("MOVE TASK ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to move task"
    );
  }

  setDraggedTask(null);
};

 const handleEditTask = async () => {
  try {
    const taskId = selectedTask?._id;

    if (!taskId) {
      alert("This task does not have a MongoDB ID.");
      return;
    }

    const response = await api.put(`/tasks/${taskId}`, {
      title: editTask.title,
      description: editTask.description,
      status: editTask.status,
      priority: editTask.priority,
      assignee: editTask.assignee || null,
      dueDate: editTask.dueDate || null,
    });

    const updatedTask = response.data;

    setTasks((prevTasks) => {
      const updated = {
        backlog: [],
        todo: [],
        "in-progress": [],
        "in-review": [],
        done: [],
      };

      Object.values(prevTasks)
        .flat()
        .forEach((task) => {
          if (task._id === updatedTask._id) {
            return;
          }

          if (updated[task.status]) {
            updated[task.status].push(task);
          }
        });

      if (updated[updatedTask.status]) {
        updated[updatedTask.status].push(updatedTask);
      }

      return updated;
    });

    setSelectedTask(updatedTask);

    alert("Task updated successfully!");
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to update task"
    );
  }
};

const handleAddComment = async () => {
  if (!selectedTask?._id) {
    alert("Task ID not found.");
    return;
  }

  if (!commentText.trim()) {
    return;
  }

  try {
    setCommentCounts((currentCounts) => ({
  ...currentCounts,
  [selectedTask._id]: (currentCounts[selectedTask._id] || 0) + 1,
}));
    const response = await api.post(
      `/comments/task/${selectedTask._id}`,
      {
        text: commentText,
      }
    );

    setComments((previousComments) => [
      ...previousComments,
      response.data,
    ]);

    setCommentText("");
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to add comment"
    );
  }
};

const handleAddTask = async () => {
  if (!newTask.title.trim()) {
    alert("Please enter a task title");
    return;
  }

  try {
    const response = await api.post(`/tasks/project/${id}`, {
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority,
      assignee: newTask.assignee || null,
      dueDate: newTask.dueDate || null,
    });

    const createdTask = response.data;

    setTasks((prevTasks) => ({
      ...prevTasks,
      todo: [...prevTasks.todo, createdTask],
    }));

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
      dueDate: "",
    });

    setShowAddTask(false);

    alert("Task created successfully!");
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to create task"
    );
  }
};

const handleOpenEditProject = () => {
  setEditProject({
    name: project.name || "",
    description: project.description || "",
    status: project.status || "active",
    priority: project.priority || "medium",
    dueDate: project.dueDate
      ? project.dueDate.split("T")[0]
      : "",
  });

  setShowEditProject(true);
};

const handleEditProject = async () => {
  try {
    const response = await api.put(`/projects/${id}`, {
      name: editProject.name,
      description: editProject.description,
      status: editProject.status,
      priority: editProject.priority,
      dueDate: editProject.dueDate || null,
    });

    setProject(response.data);

    setShowEditProject(false);

    alert("Project updated successfully!");
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to update project"
    );
  }
};

const handleAddMember = async () => {
  if (!selectedMember) {
    alert("Please select a user");
    return;
  }

  try {
    const response = await api.post(
      `/projects/${id}/members`,
      {
        userId: selectedMember,
      }
    );

    setProject(response.data);

    setSelectedMember("");
    setShowMembers(false);

    alert("Member added successfully!");
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to add member"
    );
  }
};

const handleRemoveMember = async (userId) => {
  const confirmed = window.confirm(
    "Are you sure you want to remove this member from the project?"
  );

  if (!confirmed) return;

  try {
    const response = await api.delete(
      `/projects/${id}/members`,
      {
        data: {
          userId,
        },
      }
    );

    setProject(response.data);

    alert("Member removed successfully!");
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to remove member"
    );
  }
};
  const totalTasks = Object.values(tasks).flat().length;

if (!project) {
  return <div className="loading">Loading project...</div>;
}

  return (
    <div className="project-details-page">

      {/* Header */}
      <div className="project-details-header">

        <div className="project-header-left">
          <button
            className="back-button"
            onClick={() => navigate("/projects")}
          >
            <FiArrowLeft />
          </button>

          <div>
            <div className="breadcrumb">
              Projects / {project.name}
            </div>

            <h1>{project.name}</h1>

            <p>{project.description}</p>
          </div>
        </div>

      <div style={{ display: "flex", gap: "10px" }}>
  <button
    className="secondary-btn"
    onClick={handleOpenEditProject}
  >
    Edit Project
  </button>

  <button
    className="primary-btn"
    onClick={() => setShowAddTask(true)}
  >
    <FiPlus />
    Add Task
  </button>
</div>
      </div>


{project.description && (
  <div className="project-description">
    <span>Description</span>
    <p>{project.description}</p>
  </div>
)}

      {/* Project Information */}
      <div className="project-info-grid">

        <div className="project-info-card">
          <span>Status</span>
          <strong className={`status-${project.status}`}>
  {project.status
    ? project.status
        .replace("-", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "N/A"}
</strong>
        </div>

        <div className="project-info-card">
          <span>Priority</span>
          <strong className={`priority-${project.priority}`}>
  {project.priority
    ? project.priority.charAt(0).toUpperCase() +
      project.priority.slice(1)
    : "N/A"}
</strong>
        </div>

        <div className="project-info-card">
          <span>Tasks</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="project-info-card">
          <span>Due Date</span>
          <strong>
  {project.dueDate
    ? new Date(project.dueDate).toLocaleDateString()
    : "No due date"}
</strong>
        </div>

        <div className="project-info-card">
          <span>Progress</span>

          <div className="project-progress-wrapper">
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>

            <strong>{project.progress}%</strong>
          </div>
        </div>

      </div>

      {/* Project Members */}
      <div className="project-members-section">

       <div>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <span className="section-label">
      Team Members
    </span>

    <button
      className="secondary-btn"
      onClick={() => setShowMembers(true)}
    >
      Manage Members
    </button>
  </div>

  <div className="member-avatars">
  {project.members?.map((member) => {
    const name = member?.name || "Unknown";

    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className="member-avatar"
        key={member._id}
        style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #eee",
  gap: "20px",
}}
        title={name}
      >
        {initials}
      </div>
    );
  })}
</div>
        </div>

        <div className="project-dates">
          <div>
            <FiCalendar />
           <span>
  Start:{" "}
  {project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : "N/A"}
</span>
          </div>

          <div>
            <FiCalendar />
            <span>
              Due: {project.dueDate}
            </span>
          </div>
        </div>

      </div>

      {/* Kanban */}
      <div className="kanban-section">

        <div className="kanban-header">
          <div>
            <h2>Project Board</h2>
            <p>Manage and track your project tasks</p>
          </div>

          <button
  className="secondary-btn"
  onClick={() => setShowAddTask(true)}
>
  <FiPlus />
  Add Task
</button>
        </div>

  <div className="task-toolbar">

  <div className="task-search">
    <span className="task-search-icon">🔍</span>

    <input
      type="text"
      placeholder="Search tasks..."
      value={taskSearch}
      onChange={(e) => setTaskSearch(e.target.value)}
    />
  </div>

  <select
    className="project-filter"
    value={taskPriorityFilter}
    onChange={(e) => setTaskPriorityFilter(e.target.value)}
  >
    <option value="all">All Priorities</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="urgent">Urgent</option>
  </select>

  <select
    className="project-filter"
    value={taskAssigneeFilter}
    onChange={(e) => setTaskAssigneeFilter(e.target.value)}
  >
    <option value="all">All Assignees</option>

    {users
      .filter((user) =>
        project?.members?.some(
          (member) => member._id === user._id
        )
      )
      .map((user) => (
        <option key={user._id} value={user._id}>
          {user.name}
        </option>
      ))}
  </select>

  <button
    type="button"
    className="clear-filters-btn"
    onClick={() => {
      setTaskSearch("");
      setTaskPriorityFilter("all");
      setTaskAssigneeFilter("all");
    }}
  >
    Clear Filters
  </button>

</div>

        <div className="kanban-board">

          {columns.map((column) => (
            

            <div
              className="kanban-column"
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >

              <div className="kanban-column-header">

                <div className="column-title">
                  <h3>
  {column.title} ({tasks[column.id]?.length || 0})
</h3>

                  <span className="task-count">
                    {tasks[column.id].length}
                  </span>
                </div>

                <button className="column-menu">
                  <FiMoreHorizontal />
                </button>

              </div>

              <div className="kanban-tasks">

                {tasks[column.id]
  .filter((task) => {
  const search = taskSearch.toLowerCase().trim();

  const matchesSearch =
    !search ||
    task.title?.toLowerCase().includes(search) ||
    task.assignee?.name?.toLowerCase().includes(search) ||
    task.creator?.name?.toLowerCase().includes(search);

  const matchesPriority =
    taskPriorityFilter === "all" ||
    task.priority === taskPriorityFilter;

  const matchesAssignee =
    taskAssigneeFilter === "all" ||
    task.assignee?._id === taskAssigneeFilter;

  return (
    matchesSearch &&
    matchesPriority &&
    matchesAssignee
  );
})
  .map((task) => (

               <div
     className="task-card"
  key={task._id}
  draggable
  onDragStart={() =>
    handleDragStart(task, column.id)
  }

onClick={() => {
  console.log("CLICKED TASK:", task);
  console.log("TASK MONGODB ID:", task._id);

  setSelectedTask(task);

 setEditTask({
  title: task.title || "",
  description: task.description || "",
  status: task.status || "todo",
  priority: task.priority || "medium",
  assignee: task.assignee?._id || "",
  dueDate: task.dueDate
    ? task.dueDate.split("T")[0]
    : "",
});
}}
>

                    <div className="task-card-top">

                      <span
                        className={`task-priority ${task.priority.toLowerCase()}`}
                      >
                       {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} 
                      </span>
                      <span className="task-status-label">
  {task.status === "in-progress"
    ? "In Progress"
    : task.status === "in-review"
    ? "In Review"
    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
</span>

                      <button
  className="task-menu"
  onClick={(e) => {
    e.stopPropagation();
    setOpenTaskMenu(
      openTaskMenu === task._id ? null : task._id
    );
  }}
>
  <FiMoreHorizontal />
</button>
{openTaskMenu === task._id && (
  <div
    className="task-dropdown-menu"
    onClick={(e) => e.stopPropagation()}
  >
    <button
      onClick={() => {
        setOpenTaskMenu(null);

        setSelectedTask(task);

        setEditTask({
          title: task.title || "",
          description: task.description || "",
          status: task.status || "todo",
          priority: task.priority || "medium",
          assignee: task.assignee?._id || "",
          dueDate: task.dueDate
            ? task.dueDate.split("T")[0]
            : "",
        });
      }}
    >
      ✏️ Edit Task
    </button>

  <button
  onClick={async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${task._id}`);

      setTasks((currentTasks) => {
        const updatedTasks = { ...currentTasks };

        Object.keys(updatedTasks).forEach((columnId) => {
          updatedTasks[columnId] = updatedTasks[columnId].filter(
            (item) => item._id !== task._id
          );
        });

        return updatedTasks;
      });

      setCommentCounts((currentCounts) => {
        const updatedCounts = { ...currentCounts };
        delete updatedCounts[task._id];
        return updatedCounts;
      });

      setOpenTaskMenu(null);

      if (selectedTask?._id === task._id) {
        setSelectedTask(null);
      }

      alert("Task deleted successfully!");
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  }}
>
  🗑️ Delete Task
</button>
  </div>
)}
                    </div>

                    <h3>{task.title}</h3>

                    {/* <div className="task-labels">
                      {task.labels.map((label) => (
                        <span key={label}>
                          {label}
                        </span>
                      ))}
                    </div> */}

                    <div className="task-card-footer">

                     <div className="task-assignee">
  {task.assignee ? (
    <>
      <div className="member-avatar">
        {task.assignee.name
          ?.split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>

      <span>{task.assignee.name}</span>
    </>
  ) : (
    <span>Unassigned</span>
  )}
</div>

                      <div className="task-meta">

                        <span>
                          <FiCalendar />
                         {task.dueDate && (
  <span
    className={
      new Date(task.dueDate) < new Date() &&
      task.status !== "done"
        ? "task-due-date overdue"
        : "task-due-date"
    }
  >
    {new Date(task.dueDate).toLocaleDateString()}

    {new Date(task.dueDate) < new Date() &&
      task.status !== "done" && (
        <span className="overdue-label">Overdue</span>
      )}
  </span>
)}
                        </span>

                        <span>
                          <FiMessageCircle />
                        {commentCounts[task._id] || 0}
                        </span>

                        
                      

                      </div>

                    </div>
                    <div
  className="task-creator"
  title={task.creator?.email || ""}
>
  Created by {task.creator?.name || "Unknown"}
</div>

                  </div>

                ))}

                {tasks[column.id]?.length === 0 && (
  <div className="empty-column">
    No tasks in this column
  </div>
)}

                {taskSearch.trim() &&
  tasks[column.id].filter((task) => {
    const search = taskSearch.toLowerCase().trim();

    return (
      task.title?.toLowerCase().includes(search) ||
      task.assignee?.name?.toLowerCase().includes(search) ||
      task.creator?.name?.toLowerCase().includes(search)
    );
  }).length === 0 && (
    <div className="no-tasks-found">
      No tasks found
    </div>
  )}

                {tasks[column.id].length === 0 && (
                  <div className="empty-column">
                    <FiPlus />
                    <span>Drop task here</span>
                  </div>
                )}

              </div>

             <button
  className="add-task-column"
  onClick={() => setShowAddTask(true)}
>
  <FiPlus />
  Add task
</button>

            </div>

          ))}

        </div>

      </div>
{/* TASK DETAILS MODAL */}
      {selectedTask && (
        <div
          className="task-modal-overlay"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="task-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="task-modal-header">

              <div>
                <span className="task-modal-id">
  NEW TASK
</span>

<h2>Create New Task</h2>

                <input
  type="text"
  value={editTask.title}
  onChange={(e) =>
    setEditTask({
      ...editTask,
      title: e.target.value,
    })
  }
/>
                <button
  className="secondary-btn"
  onClick={() => {
 setEditTask({
  title: selectedTask.title || "",
  description: selectedTask.description || "",
  status: selectedTask.status || "todo",
  priority: selectedTask.priority || "medium",
  assignee: selectedTask.assignee?._id || "",
  dueDate: selectedTask.dueDate
    ? selectedTask.dueDate.split("T")[0]
    : "",
});
  }}
>
  Edit Task
</button>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedTask(null)}
              >
                <FiX />
              </button>

            </div>

            {/* Description */}
            <div className="task-modal-section">

              <h4>Description</h4>

              <textarea
  value={editTask.description}
  onChange={(e) =>
    setEditTask({
      ...editTask,
      description: e.target.value,
    })
  }
  placeholder="Enter task description..."
/>

            </div>


            {/* Properties */}
            <div className="task-properties">

              <div className="task-property">

                <span>Status</span>

                <select
  value={editTask.status}
  onChange={(e) =>
    setEditTask({
      ...editTask,
      status: e.target.value,
    })
  }
>
  <option value="backlog">Backlog</option>
  <option value="todo">To Do</option>
  <option value="in-progress">In Progress</option>
  <option value="in-review">In Review</option>
  <option value="done">Completed</option>
</select>
                 

              </div>


              <div className="task-property">

                <span>Priority</span>
<select
  value={editTask.priority}
  onChange={(e) =>
    setEditTask({
      ...editTask,
      priority: e.target.value,
    })
  }
>
  <option value="low">Low</option>
<option value="medium">Medium</option>
<option value="high">High</option>
<option value="urgent">Urgent</option>
</select>
                  

              </div>


              <div className="task-property">
  <span>Assignee</span>

  <select
    value={editTask.assignee}
    onChange={(e) =>
      setEditTask({
        ...editTask,
        assignee: e.target.value,
      })
    }
  >
    <option value="">Unassigned</option>

   {project?.members?.map((member) => (
  <option key={member._id} value={member._id}>
    {member.name} ({member.email})
  </option>
))}
  </select>
</div>


              <div className="task-property">

                <span>Due Date</span>

                <div className="property-value">
  <FiCalendar />

  <input
    type="date"
    value={editTask.dueDate}
    onChange={(e) =>
      setEditTask({
        ...editTask,
        dueDate: e.target.value,
      })
    }
  />
</div>

              </div>

            </div>


            {/* Labels */}
<div className="task-modal-section">

  <h4>Labels</h4>

  <div className="modal-labels">

    {labels.map((label) => (
      <span key={label} className="task-label">
        {label}

        <button
          type="button"
          onClick={() => {
            setLabels((previous) =>
              previous.filter((item) => item !== label)
            );
          }}
        >
          ×
        </button>
      </span>
    ))}

    <button
      className="add-label"
      type="button"
      onClick={() => {
        const newLabel = prompt("Enter label name:");

        if (newLabel && newLabel.trim()) {
          setLabels((previous) => [
            ...previous,
            newLabel.trim(),
          ]);
        }
      }}
    >
      <FiPlus />
      Add label
    </button>

  </div>

</div>


           {/* Subtasks */}
<div className="task-modal-section">

  <div className="section-heading">
    <h4>Subtasks</h4>

    <span>
      {subtasks.filter((subtask) => subtask.completed).length} /{" "}
      {subtasks.length} completed
    </span>
  </div>

  {subtasks.map((subtask) => (
    <div className="subtask" key={subtask.id}>

      <div
        className={
          subtask.completed
            ? "subtask-check"
            : "subtask-empty"
        }
        onClick={() => {
          setSubtasks((previous) =>
            previous.map((item) =>
              item.id === subtask.id
                ? {
                    ...item,
                    completed: !item.completed,
                  }
                : item
            )
          );
        }}
        style={{ cursor: "pointer" }}
      >
        {subtask.completed && <FiCheck />}
      </div>

      <span
        className={
          subtask.completed
            ? "completed-subtask"
            : ""
        }
      >
        {subtask.title}
      </span>

    </div>
  ))}

</div>


           {/* Comments */}
<div className="task-modal-section">
  <h4>
    Comments ({comments.length})
  </h4>

  {comments.length === 0 ? (
    <p className="no-comments">
      No comments yet.
    </p>
  ) : (
    comments.map((comment) => (
      <div className="comment" key={comment._id}>
        <div className="comment-avatar">
          {comment.author?.name
            ? comment.author.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "UN"}
        </div>

        <div className="comment-content">
          <strong>
            {comment.author?.name || "Unknown User"}
          </strong>

          <span>
            {new Date(comment.createdAt).toLocaleString()}
          </span>

          <p>{comment.text}</p>
        </div>
      </div>
    ))
  )}

  <div className="comment-input">
    <input
      type="text"
      placeholder="Write a comment..."
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleAddComment();
        }
      }}
    />

    <button onClick={handleAddComment}>
      Send
    </button>
  </div>
</div>
            {/* Footer */}
            <div className="task-modal-footer">

              <button
                className="secondary-btn"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </button>

             <button
  className="primary-btn"
  onClick={handleEditTask}
>
  Save Changes
</button>
            </div>
          </div>
          </div>
          )}
          

          {/* MANAGE MEMBERS MODAL */}
{showMembers && (
  <div
    className="task-modal-overlay"
    onClick={() => setShowMembers(false)}
  >
    <div
      className="task-modal add-task-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="task-modal-header">
        <div>
          <span className="task-modal-id">
            PROJECT MEMBERS
          </span>

          <h2>Manage Members</h2>
        </div>

        <button
          className="modal-close"
          onClick={() => setShowMembers(false)}
        >
          <FiX />
        </button>
      </div>

      <div className="form-group">
        <label>Add Member</label>

        <select
          value={selectedMember}
          onChange={(event) =>
            setSelectedMember(event.target.value)
          }
        >
          <option value="">
            Select a user
          </option>

          {users
            .filter(
              (user) =>
                !project.members?.some(
                  (member) =>
                    member._id === user._id
                )
            )
            .map((user) => (
              <option
                key={user._id}
                value={user._id}
              >
                {user.name} ({user.email})
              </option>
            ))}
        </select>
      </div>

      <div className="task-modal-section">
        <h4>Current Members</h4>

        {project.members?.length === 0 ? (
          <p>No members added.</p>
        ) : (
          project.members?.map((member) => (
            <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: "20px",
  }}
>
  <div>
    <strong>{member.name}</strong>

<div>
  <small>{member.email}</small>
</div>

<div style={{ marginTop: "4px" }}>
  <small>
    {member._id === project.owner?._id
      ? "Project Owner"
      : "Member"}
  </small>
</div>
  </div>

  {member._id !== project.owner?._id && (
    <button
      className="secondary-btn"
      onClick={() => handleRemoveMember(member._id)}
    >
      Remove
    </button>
  )}
</div>
          ))
        )}
      </div>

      <div className="task-modal-footer">
        <button
          className="secondary-btn"
          onClick={() => setShowMembers(false)}
        >
          Cancel
        </button>

        <button
          className="primary-btn"
          onClick={handleAddMember}
        >
          Add Member
        </button>
      </div>
    </div>
  </div>
)}

        {/* EDIT PROJECT MODAL */}
{showEditProject && (
  <div
    className="task-modal-overlay"
    onClick={() => setShowEditProject(false)}
  >
    <div
      className="task-modal add-task-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="task-modal-header">
        <div>
          <span className="task-modal-id">
            PROJECT SETTINGS
          </span>

          <h2>Edit Project</h2>
        </div>

        <button
          className="modal-close"
          onClick={() => setShowEditProject(false)}
        >
          <FiX />
        </button>
      </div>

      <div className="form-group">
        <label>Project Name</label>

        <input
          type="text"
          value={editProject.name}
          onChange={(event) =>
            setEditProject({
              ...editProject,
              name: event.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Description</label>

        <textarea
          value={editProject.description}
          onChange={(event) =>
            setEditProject({
              ...editProject,
              description: event.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Status</label>

        <select
          value={editProject.status}
          onChange={(event) =>
            setEditProject({
              ...editProject,
              status: event.target.value,
            })
          }
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      <div className="form-group">
        <label>Priority</label>

        <select
          value={editProject.priority}
          onChange={(event) =>
            setEditProject({
              ...editProject,
              priority: event.target.value,
            })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="form-group">
        <label>Due Date</label>

        <input
          type="date"
          value={editProject.dueDate}
          onChange={(event) =>
            setEditProject({
              ...editProject,
              dueDate: event.target.value,
            })
          }
        />
      </div>

      <div className="task-modal-footer">
        <button
          className="secondary-btn"
          onClick={() => setShowEditProject(false)}
        >
          Cancel
        </button>

        <button
  className="primary-btn"
  onClick={handleEditProject}
>
  Save Changes
</button>
      </div>
    </div>
  </div>
)}

          
          {/* ADD TASK MODAL */}
      {showAddTask && (
        <div
          className="task-modal-overlay"
          onClick={() => setShowAddTask(false)}
        >
          <div
            className="task-modal add-task-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="task-modal-header">

              <div>
            <span className="task-modal-id">
  {selectedTask
    ? `TASK-${selectedTask._id?.slice(-6).toUpperCase()}`
    : "NEW TASK"}
</span>
                <h2>Create New Task</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowAddTask(false)}
              >
                <FiX />
              </button>

            </div>


            <div className="form-group">
              <label>Task Title</label>

              <input
                type="text"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    title: event.target.value,
                  })
                }
              />
            </div>
<div className="form-group">
  <label>Description</label>

  <textarea
    placeholder="Enter task description"
    value={newTask.description}
    onChange={(event) =>
      setNewTask({
        ...newTask,
        description: event.target.value,
      })
    }
  />
</div>

            <div className="form-group">
              <label>Priority</label>

              <select
                value={newTask.priority}
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    priority: event.target.value,
                  })
                }
              >
                <option value="low">Low</option>
<option value="medium">Medium</option>
<option value="high">High</option>
<option value="urgent">Urgent</option>
              </select>
            </div>


            <div className="form-group">
              <label>Assignee</label>

              <select
  value={newTask.assignee}
  onChange={(e) =>
    setNewTask({
      ...newTask,
      assignee: e.target.value,
    })
  }
>
  <option value="">Unassigned</option>

  {project?.members?.map((member) => (
  <option key={member._id} value={member._id}>
    {member.name} ({member.email})
  </option>
))}
</select>
            </div>


            <div className="form-group">
              <label>Due Date</label>

              <input
                type="date"
                value={newTask.dueDate}
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    dueDate: event.target.value,
                  })
                }
              />
            </div>


                       <div className="task-modal-footer">

              <button
  className="secondary-btn"
  onClick={() => setShowAddTask(false)}
>
  Cancel
</button>

          <button
  className="primary-btn"
  onClick={handleAddTask}
>
  Create Task
</button>

            </div>

          </div>
        </div>
      )}
       


  </div>
  
  );
  
}


export default ProjectDetails;