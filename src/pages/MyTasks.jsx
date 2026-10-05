import { useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiMoreHorizontal,
  FiCalendar,
} from "react-icons/fi";

function MyTasks() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);

  const [tasks, setTasks] = useState([
    {
      id: "TSK-001",
      title: "Complete dashboard UI",
      description:
        "Finish the main dashboard interface including statistics, project progress and recent activity.",
      project: "TaskFlow SaaS",
      status: "In Progress",
      priority: "High",
      dueDate: "Today",
      assignee: "S",
      comments: 4,
    },
    {
      id: "TSK-002",
      title: "Fix authentication flow",
      description:
        "Review login and authentication flow and fix validation issues.",
      project: "TaskFlow SaaS",
      status: "To Do",
      priority: "High",
      dueDate: "Tomorrow",
      assignee: "S",
      comments: 2,
    },
    {
      id: "TSK-003",
      title: "Deploy portfolio",
      description:
        "Deploy the latest version of the portfolio website.",
      project: "Portfolio Website",
      status: "To Do",
      priority: "Medium",
      dueDate: "Sep 8",
      assignee: "S",
      comments: 1,
    },
    {
      id: "TSK-004",
      title: "Prepare project documentation",
      description:
        "Create README and technical documentation for the project.",
      project: "Marketing Dashboard",
      status: "In Review",
      priority: "Medium",
      dueDate: "Sep 10",
      assignee: "S",
      comments: 5,
    },
    {
      id: "TSK-005",
      title: "Create responsive navbar",
      description:
        "Make the navbar responsive for tablet and mobile devices.",
      project: "TaskFlow SaaS",
      status: "Done",
      priority: "Low",
      dueDate: "Sep 5",
      assignee: "S",
      comments: 3,
    },
    {
      id: "TSK-006",
      title: "Setup database structure",
      description:
        "Create the initial database structure for users, projects and tasks.",
      project: "TaskFlow SaaS",
      status: "Backlog",
      priority: "High",
      dueDate: "Sep 12",
      assignee: "S",
      comments: 0,
    },
  ]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.project.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const toggleTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Done" ? "To Do" : "Done",
            }
          : task
      )
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Done":
        return "task-status done";
      case "In Progress":
        return "task-status progress";
      case "In Review":
        return "task-status review";
      case "Backlog":
        return "task-status backlog";
      default:
        return "task-status todo";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority high";
      case "Medium":
        return "priority medium";
      default:
        return "priority low";
    }
  };

  return (
    <div className="my-tasks-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p>View and manage all tasks assigned to you.</p>
        </div>

        <button className="primary-btn">
          + Add Task
        </button>
      </div>

      {/* TASK SUMMARY */}
      <div className="task-summary-grid">

        <div className="task-summary-card">
          <div className="summary-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="summary-icon">
            <FiClock />
          </div>

          <div>
            <span>In Progress</span>
            <strong>
              {tasks.filter(
                (task) => task.status === "In Progress"
              ).length}
            </strong>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="summary-icon">
            <FiAlertCircle />
          </div>

          <div>
            <span>High Priority</span>
            <strong>
              {tasks.filter(
                (task) => task.priority === "High"
              ).length}
            </strong>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="summary-icon">
            <FiCalendar />
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {tasks.filter(
                (task) => task.status === "Done"
              ).length}
            </strong>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}
      <div className="task-toolbar">

        <div className="task-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="task-filters">

          <div className="filter-control">
            <FiFilter />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Backlog">Backlog</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="In Review">
                In Review
              </option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="filter-control">
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* TASK TABLE */}
      <div className="tasks-table-card">

        <div className="tasks-table-header">
          <div>
            <h3>Assigned Tasks</h3>
            <p>
              {filteredTasks.length} task
              {filteredTasks.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button className="icon-btn">
            <FiMoreHorizontal />
          </button>
        </div>

        <div className="tasks-table">

          <div className="task-table-row task-table-heading">
            <div>Task</div>
            <div>Project</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Due Date</div>
            <div></div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-tasks">
              <FiCheckCircle />
              <h3>No tasks found</h3>
              <p>
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                className="task-table-row"
                key={task.id}
              >

                {/* TASK */}
                <div className="task-name-cell">

                  <button
                    className={`task-checkbox ${
                      task.status === "Done"
                        ? "checked"
                        : ""
                    }`}
                    onClick={() =>
                      toggleTask(task.id)
                    }
                  >
                    {task.status === "Done" && "✓"}
                  </button>

                  <div>
                    <strong
                      onClick={() =>
                        setSelectedTask(task)
                      }
                    >
                      {task.title}
                    </strong>

                    <span>{task.id}</span>
                  </div>

                </div>

                {/* PROJECT */}
                <div className="project-cell">
                  {task.project}
                </div>

                {/* STATUS */}
                <div>
                  <span className={getStatusClass(task.status)}>
                    {task.status}
                  </span>
                </div>

                {/* PRIORITY */}
                <div>
                  <span
                    className={getPriorityClass(
                      task.priority
                    )}
                  >
                    {task.priority}
                  </span>
                </div>

                {/* DATE */}
                <div className="due-date">
                  <FiCalendar />
                  {task.dueDate}
                </div>

                {/* MENU */}
                <div>
                  <button className="icon-btn">
                    <FiMoreHorizontal />
                  </button>
                </div>

              </div>
            ))
          )}

        </div>
      </div>

      {/* TASK DETAILS MODAL */}
      {selectedTask && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="task-details-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">
              <div>
                <span className="task-id">
                  {selectedTask.id}
                </span>

                <h2>{selectedTask.title}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedTask(null)
                }
              >
                ×
              </button>
            </div>

            <div className="task-modal-body">

              <div className="task-description">
                <h4>Description</h4>
                <p>{selectedTask.description}</p>
              </div>

              <div className="task-detail-grid">

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedTask.status}
                  </strong>
                </div>

                <div>
                  <span>Priority</span>
                  <strong>
                    {selectedTask.priority}
                  </strong>
                </div>

                <div>
                  <span>Project</span>
                  <strong>
                    {selectedTask.project}
                  </strong>
                </div>

                <div>
                  <span>Due Date</span>
                  <strong>
                    {selectedTask.dueDate}
                  </strong>
                </div>

              </div>

            </div>

            <div className="modal-footer">
              <button
                className="secondary-btn"
                onClick={() =>
                  setSelectedTask(null)
                }
              >
                Close
              </button>

              <button className="primary-btn">
                Edit Task
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default MyTasks;