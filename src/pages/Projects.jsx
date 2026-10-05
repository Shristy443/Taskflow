import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiMoreHorizontal,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";
import api from "../api/axios";

function Projects() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [openMenu, setOpenMenu] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
    priority: "medium",
    dueDate: "",
  });

  // =========================
  // FETCH PROJECTS
  // =========================

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects");

      setProjects(response.data);
      const taskResponses = await Promise.all(
  response.data.map((project) =>
    api.get(`/tasks/project/${project._id}`)
  )
);

const taskCounts = {};

response.data.forEach((project, index) => {
  const tasks = taskResponses[index].data || [];

  taskCounts[project._id] = {
    total: tasks.length,
    completed: tasks.filter(
      (task) => task.status === "done"
    ).length,
  };
});

setProjectTasks(taskCounts);
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FILTER PROJECTS
  // =========================

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      project.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // =========================
  // CREATE PROJECT
  // =========================

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!newProject.name.trim()) {
      return;
    }

    try {
      setError("");

      const response = await api.post("/projects", {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        priority: newProject.priority,
        dueDate: newProject.dueDate || undefined,
      });

      // Add newly created project to the list
      setProjects((prevProjects) => [
        response.data,
        ...prevProjects,
      ]);

      // Reset form
      setNewProject({
        name: "",
        description: "",
        status: "active",
        priority: "medium",
        dueDate: "",
      });

      // Close modal
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create project:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create project"
      );
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "No deadline";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // DISPLAY STATUS
  // =========================

  const formatStatus = (status) => {
    const statusMap = {
      active: "Active",
      completed: "Completed",
      "on-hold": "On Hold",
    };

    return statusMap[status] || status;
  };

  // =========================
  // DISPLAY PRIORITY
  // =========================

  const formatPriority = (priority) => {
    if (!priority) return "";

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  return (
    <div className="projects-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">
        <div>
          <h1>Projects</h1>
          <p>
            Manage and track all your workspace projects.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          <FiPlus />
          New Project
        </button>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="projects-toolbar">

        <div className="projects-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* STATUS FILTER */}

        <select
          className="project-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">All Projects</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>

        {/* PRIORITY FILTER */}

        <select
          className="project-filter"
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-2">
            Loading projects...
          </p>
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =========================
          NO PROJECTS
      ========================= */}

      {!loading &&
        !error &&
        projects.length === 0 && (
          <div className="text-center py-5">
            <h5>No projects yet</h5>

            <p className="text-muted">
              Create your first project to get started.
            </p>
          </div>
        )}

      {/* =========================
          PROJECTS
      ========================= */}

      {!loading &&
        projects.length > 0 && (
          <div className="projects-grid">

            {filteredProjects.map((project) => (
              <div
                className="project-card"
                key={project._id}
                onClick={() =>
                  navigate(
                    `/projects/${project._id}`
                  )
                }
              >

                {/* CARD TOP */}

                <div className="project-card-top">

                  <span
                    className={`status-badge ${project.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {formatStatus(project.status)}
                  </span>

                  <button
                    className="project-more"
                   onClick={(e) => {
  e.stopPropagation();
  setOpenMenu(
    openMenu === project._id
      ? null
      : project._id
  );
}}
                  >
                    <FiMoreHorizontal />
                  </button>
                  {openMenu === project._id && (
  <div
    className="project-menu"
    onClick={(e) => e.stopPropagation()}
  >
    <button
      onClick={() => {
        setOpenMenu(null);
        navigate(`/projects/${project._id}`);
      }}
    >
      ✏️ Edit Project
    </button>

    <button
  onClick={async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/projects/${project._id}`);

      setProjects((currentProjects) =>
        currentProjects.filter(
          (item) => item._id !== project._id
        )
      );

      setOpenMenu(null);

      alert("Project deleted successfully!");
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete project"
      );
    }
  }}
>
  🗑️ Delete Project
</button>
  </div>
)}

                </div>

                {/* PROJECT NAME */}

                <h3>{project.name}</h3>

                {/* DESCRIPTION */}

                <p className="project-description">
                  {project.description ||
                    "No description provided."}
                </p>

                {/* META */}

                <div className="project-meta">

                  <div>
                    <FiCalendar />
                    {formatDate(project.dueDate)}
                  </div>

                  <div>
                    <FiUsers />

                    {project.members?.length || 0}{" "}
                    members
                  </div>

                </div>

                {/* PROGRESS */}

                {/* PROGRESS */}

<div className="project-progress-header">
  <span>Progress</span>

  <strong>
    {projectTasks[project._id]?.total
      ? Math.round(
          (projectTasks[project._id].completed /
            projectTasks[project._id].total) *
            100
        )
      : 0}
    %
  </strong>
</div>

<div className="progress">
  <div
    className="progress-bar"
    style={{
      width: `${
        projectTasks[project._id]?.total
          ? Math.round(
              (projectTasks[project._id].completed /
                projectTasks[project._id].total) *
                100
            )
          : 0
      }%`,
    }}
  ></div>
</div>

                {/* FOOTER */}

                <div className="project-card-footer">

                  <div className="member-stack">

                    {project.members?.map(
                      (member, index) => (
                        <div
                          className="member-avatar"
                          key={
                            member._id || index
                          }
                        >
                          {member.name
                            ? member.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                        </div>
                      )
                    )}

                  </div>

                 <span>
  {projectTasks[project._id]?.completed || 0}/
  {projectTasks[project._id]?.total || 0} tasks
</span>

                </div>

              </div>
            ))}

          </div>
        )}

      {/* =========================
          FILTER EMPTY STATE
      ========================= */}

      {!loading &&
        !error &&
        projects.length > 0 &&
        filteredProjects.length === 0 && (
          <div className="empty-projects">
            <h3>No projects found</h3>

            <p>
              Try another search or change your
              filters.
            </p>
          </div>
        )}

      {/* =========================
          CREATE PROJECT MODAL
      ========================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="project-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>
                <h2>Create Project</h2>

                <p>
                  Set up a new project in your
                  workspace.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleCreateProject}>

              {/* PROJECT NAME */}

              <div className="form-group">

                <label>
                  Project Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      name: e.target.value,
                    })
                  }
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  rows="3"
                  placeholder="Describe your project..."
                  value={
                    newProject.description
                  }
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description:
                        e.target.value,
                    })
                  }
                />

              </div>

              {/* STATUS + PRIORITY */}

              <div className="form-row">

                {/* STATUS */}

                <div className="form-group">

                  <label>Status</label>

                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        status:
                          e.target.value,
                      })
                    }
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="on-hold">
                      On Hold
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>

                </div>

                {/* PRIORITY */}

                <div className="form-group">

                  <label>Priority</label>

                  <select
                    value={
                      newProject.priority
                    }
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        priority:
                          e.target.value,
                      })
                    }
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>

                </div>

              </div>

              {/* DUE DATE */}

              <div className="form-group">

                <label>Due Date</label>

                <input
                  type="date"
                  value={
                    newProject.dueDate
                  }
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      dueDate:
                        e.target.value,
                    })
                  }
                />

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Create Project
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Projects;