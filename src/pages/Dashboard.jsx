import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

import {
  FiFolder,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiMoreHorizontal,
} from "react-icons/fi";

function Dashboard() {
  const location = useLocation();
 const [stats, setStats] = useState([
  {
    title: "Total Projects",
    value: 0,
    change: "Your projects",
    icon: <FiFolder />,
  },
  {
    title: "Active Projects",
    value: 0,
    change: "Currently active",
    icon: <FiClock />,
  },
  {
    title: "Completed Tasks",
    value: 0,
    change: "Tasks completed",
    icon: <FiCheckCircle />,
  },
  {
    title: "Overdue Tasks",
    value: 0,
    change: "Needs attention",
    icon: <FiAlertCircle />,
  },
]);
const [productivityPeriod, setProductivityPeriod] = useState("week");
const [productivity, setProductivity] = useState([
  { day: "M", count: 0 },
  { day: "T", count: 0 },
  { day: "W", count: 0 },
  { day: "T", count: 0 },
  { day: "F", count: 0 },
  { day: "S", count: 0 },
  { day: "S", count: 0 },
]);

const [projects, setProjects] = useState([]);
const [upcomingTasks, setUpcomingTasks] = useState([]);
const [recentActivity, setRecentActivity] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [userName, setUserName] = useState("User");
const [greeting, setGreeting] = useState("Good morning");
  
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const currentHour = new Date().getHours();

if (currentHour < 12) {
  setGreeting("Good morning");
} else if (currentHour < 18) {
  setGreeting("Good afternoon");
} else {
  setGreeting("Good evening");
}
const storedUser = localStorage.getItem("user");

if (storedUser) {
  const user = JSON.parse(storedUser);
  setUserName(user.name || user.username || "User");
}
      // Fetch projects
      const projectsResponse = await api.get("/projects");

      const projectData = projectsResponse.data || [];

      // Fetch tasks for every project
      const taskResponses = await Promise.all(
        projectData.map((project) =>
          api.get(`/tasks/project/${project._id}`)
        )
      );

      const allTasks = taskResponses.flatMap(
        (response) => response.data || []
      );

      // Calculate statistics
      const totalProjects = projectData.length;

      const activeProjects = projectData.filter(
        (project) => project.status === "active"
      ).length;

      const completedTasks = allTasks.filter(
        (task) => task.status === "done"
      ).length;

      const today = new Date();

      const overdueTasks = allTasks.filter((task) => {
        if (!task.dueDate || task.status === "done") {
          return false;
        }

        return new Date(task.dueDate) < today;
      }).length;

      setStats([
        {
          title: "Total Projects",
          value: totalProjects,
          change: "Your projects",
          icon: <FiFolder />,
        },
        {
          title: "Active Projects",
          value: activeProjects,
          change: "Currently active",
          icon: <FiClock />,
        },
        {
          title: "Completed Tasks",
          value: completedTasks,
          change: "Tasks completed",
          icon: <FiCheckCircle />,
        },
        {
          title: "Overdue Tasks",
          value: overdueTasks,
          change: overdueTasks > 0 ? "Needs attention" : "All on track",
          icon: <FiAlertCircle />,
        },
      ]);

      // Calculate project progress
      const projectsWithProgress = projectData.map((project) => {
        const projectTasks = allTasks.filter(
          (task) =>
            String(task.project?._id || task.project) ===
            String(project._id)
        );

        const completed = projectTasks.filter(
          (task) => task.status === "done"
        ).length;

        const total = projectTasks.length;

        const progress =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...project,
          progress,
          tasks: `${completed} / ${total} tasks`,
        };
      });

      setProjects(projectsWithProgress.slice(0, 5));

      // Upcoming tasks
      const upcoming = allTasks
        .filter((task) => task.dueDate && task.status !== "done")
        .map((task) => {
          const project = projectData.find(
            (item) =>
              String(item._id) ===
              String(task.project?._id || task.project)
          );

         return {
  ...task,
  projectName: project?.name || "Unknown Project",
  projectId: project?._id || null,
};
        })
        .sort(
          (a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate)
        )
        .slice(0, 5);

      setUpcomingTasks(upcoming);
      // Calculate weekly productivity
// Calculate productivity
const todayDate = new Date();

if (productivityPeriod === "week") {
  const startOfWeek = new Date(todayDate);
  const dayOfWeek = startOfWeek.getDay();

  const diffToMonday =
    dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  startOfWeek.setDate(
    startOfWeek.getDate() + diffToMonday
  );

  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyCompletedTasks = allTasks.filter((task) => {
    if (task.status !== "done" || !task.updatedAt) {
      return false;
    }

    const completedDate = new Date(task.updatedAt);

    return completedDate >= startOfWeek;
  });

  const productivityData = [
    { day: "M", count: 0 },
    { day: "T", count: 0 },
    { day: "W", count: 0 },
    { day: "T", count: 0 },
    { day: "F", count: 0 },
    { day: "S", count: 0 },
    { day: "S", count: 0 },
  ];

  weeklyCompletedTasks.forEach((task) => {
    const completedDate = new Date(task.updatedAt);

    const dayIndex =
      completedDate.getDay() === 0
        ? 6
        : completedDate.getDay() - 1;

    productivityData[dayIndex].count += 1;
  });

  setProductivity(productivityData);
} else {
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();

  const monthlyCompletedTasks = allTasks.filter((task) => {
    if (task.status !== "done" || !task.updatedAt) {
      return false;
    }

    const completedDate = new Date(task.updatedAt);

    return (
      completedDate.getFullYear() === currentYear &&
      completedDate.getMonth() === currentMonth
    );
  });

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const productivityData = Array.from(
    { length: daysInMonth },
    (_, index) => ({
      day: String(index + 1),
      count: 0,
    })
  );

  monthlyCompletedTasks.forEach((task) => {
    const completedDate = new Date(task.updatedAt);
    const dayIndex = completedDate.getDate() - 1;

    productivityData[dayIndex].count += 1;
  });

  setProductivity(productivityData);
}
const activityData = [
  ...projectData.map((project) => ({
    id: `project-${project._id}`,
    type: "project",
    name: project.owner?.name || userName,
    text: "created a project",
    time: project.createdAt,
    initial: (project.owner?.name || userName).charAt(0).toUpperCase(),
  })),

  ...allTasks
    .filter((task) => task.updatedAt)
    .map((task) => ({
      id: `task-${task._id}`,
      type: "task",
      name: task.assignee?.name || userName,
      text:
        task.status === "done"
          ? "completed a task"
          : "updated a task",
      time: task.updatedAt,
      initial: (task.assignee?.name || userName)
        .charAt(0)
        .toUpperCase(),
    })),
];

activityData.sort(
  (a, b) => new Date(b.time) - new Date(a.time)
);

setRecentActivity(activityData.slice(0, 5));
    } catch (error) {
      console.error("FETCH DASHBOARD ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [location, productivityPeriod]);
return (
  <div className="dashboard">
    {loading && (
      <div className="dashboard-card">
        <h3>Loading dashboard...</h3>
        <p>Please wait while we fetch your latest project data.</p>
      </div>
    )}

    {!loading && error && (
      <div className="dashboard-card">
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>

        <button
          className="primary-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )}

    {!loading && !error && (
      <>
      {/* Header */}
      <div className="dashboard-header">
        <div>
         <h1>{greeting}, {userName} 👋</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>

        <button
  className="primary-btn"
  onClick={() => {
    window.location.href = "/projects";
  }}
>
  + New Project
</button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-top">
              <div className="stat-icon">
                {stat.icon}
              </div>

              <FiMoreHorizontal className="more-icon" />
            </div>

            <h2>{stat.value}</h2>

            <p>{stat.title}</p>

            <span className="stat-change">
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Main dashboard grid */}
      <div className="dashboard-grid">

        {/* Project Progress */}
        <section className="dashboard-card project-progress">
          <div className="card-header">
            <div>
              <h3>Project Progress</h3>
              <p>Track the progress of your active projects.</p>
            </div>

            <a href="/projects">View all</a>
          </div>

        <div className="project-list">
  {projects.length > 0 ? (
    projects.map((project) => (
      <div className="project-progress-item" key={project._id}>
        <div className="project-info">
          <strong
            onClick={() => {
              window.location.href = `/projects/${project._id}`;
            }}
            style={{ cursor: "pointer" }}
          >
            {project.name}
          </strong>

          <span>{project.tasks}</span>
        </div>

        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>

        <div className="progress-value">
          {project.progress}%
        </div>
      </div>
    ))
  ) : (
    <p>No projects available yet.</p>
  )}
</div>
        </section>

        {/* Upcoming Tasks */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Upcoming Tasks</h3>
              <p>Your next deadlines.</p>
            </div>

            <a href="/tasks">View all</a>
          </div>

          <div className="task-list">
  {upcomingTasks.length > 0 ? (
    upcomingTasks.map((task) => (
              <div
  className="upcoming-task"
  key={task._id}
  onClick={() => {
    if (task.projectId) {
      window.location.href = `/projects/${task.projectId}`;
    }
  }}
  style={{ cursor: task.projectId ? "pointer" : "default" }}
>
                <div className="task-check"></div>

                <div className="task-content">
                 <strong>{task.title}</strong>
<span>{task.projectName}</span>
                </div>

               <div className="task-date">
  {new Date(task.dueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}
</div>
              </div>
            ))
              ) : (
    <p>No upcoming tasks.</p>
  )}
          </div>
        </section>
      </div>

      {/* Bottom section */}
      <div className="dashboard-grid">

        {/* Productivity */}
        <section className="dashboard-card productivity">
          <div className="card-header">
            <div>
              <h3>Productivity</h3>
              <p>Tasks completed this week.</p>
            </div>

            <select
  value={productivityPeriod}
  onChange={(e) => setProductivityPeriod(e.target.value)}
>
  <option value="week">This week</option>
  <option value="month">This month</option>
</select>
          </div>

          <div
  className="chart-placeholder"
  style={{
    overflowX: productivityPeriod === "month" ? "auto" : "hidden",
  }}
>
  <div
    className="chart-bars"
    style={{
      minWidth: productivityPeriod === "month" ? "900px" : "100%",
    }}
  >
    {productivity.map((item, index) => {
      const maxCount = Math.max(
        ...productivity.map((item) => item.count),
        1
      );

      const height = (item.count / maxCount) * 100;

      return (
        <div className="bar-wrapper" key={index}>
          <div
            className="chart-bar"
            style={{ height: `${height}%` }}
          ></div>

          <span>{item.day}</span>
        </div>
      );
    })}
  </div>
</div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest workspace updates.</p>
            </div>

            <FiMoreHorizontal />
          </div>

        <div className="activity-list">
  {recentActivity.map((activity) => (
    <div className="activity-item" key={activity.id}>
      <div className="activity-avatar">
        {activity.initial}
      </div>

      <div>
        <strong>{activity.name}</strong>{" "}
        {activity.text}

        <span>
          {new Date(activity.time).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  ))}

  {recentActivity.length === 0 && (
    <p>No recent activity yet.</p>
  )}
</div>
        </section>
      </div>
      </>
    )}
  </div>
  );
}
   

export default Dashboard;