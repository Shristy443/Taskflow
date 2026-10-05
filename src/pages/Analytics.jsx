import {
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiUsers,
  FiActivity,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../api/axios";
 

function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Get projects
        const projectResponse = await api.get("/projects");
        const projectData = projectResponse.data;

        setProjects(projectData);

        // Get users
        const userResponse = await api.get("/users");
        setUsers(userResponse.data);

        // Get tasks from every project
        let allTasks = [];

        for (const project of projectData) {
          const taskResponse = await api.get(
            `/tasks/project/${project._id}`
          );

          const projectTasks = taskResponse.data.map((task) => ({
            ...task,
            projectName: project.name,
          }));

          allTasks = [...allTasks, ...projectTasks];
        }

        setTasks(allTasks);
      } catch (error) {
        console.error(
          "FETCH ANALYTICS DATA ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Task statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") {
      return false;
    }

    return new Date(task.dueDate) < new Date();
  }).length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const backlogTasks = tasks.filter(
    (task) => task.status === "backlog"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "in-review"
  ).length;
  // Weekly productivity
const weeklyProductivity = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
  (day, index) => {
    const count = tasks.filter((task) => {
      if (task.status !== "done" || !task.updatedAt) {
        return false;
      }

      const taskDate = new Date(task.updatedAt);
      const dayIndex = taskDate.getDay();

      // Convert Sunday=0 to Monday=0
      const mondayBasedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

      return mondayBasedIndex === index;
    }).length;

    return [day, count];
  }
);

  return (
    <div className="analytics-page">

      {loading && (
  <div className="empty-state">
    Loading analytics...
  </div>
)}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Track your team's productivity and project performance.
          </p>
        </div>

        <select className="analytics-period">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>This year</option>
        </select>
      </div>

      {/* Stats */}
      <div className="analytics-stats">

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <FiActivity />
          </div>

          <div>
            <span>Total Tasks</span>
            <h2>{totalTasks}</h2>
           <small>
  {totalTasks === 0 ? "No tasks yet" : `${totalTasks} total tasks`}
</small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <h2>{completedTasks}</h2>
            <small>
  {totalTasks === 0
    ? "No tasks yet"
    : `${Math.round((completedTasks / totalTasks) * 100)}% of total tasks`}
</small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <FiClock />
          </div>

          <div>
            <span>In Progress</span>
            <h2>{inProgressTasks}</h2>
            <small>
  {totalTasks === 0
    ? "No tasks yet"
    : `${Math.round((inProgressTasks / totalTasks) * 100)}% of total tasks`}
</small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <FiAlertCircle />
          </div>

          <div>
            <span>Overdue</span>
            <h2>{overdueTasks}</h2>
            <small className="negative">
              Needs attention
            </small>
          </div>
        </div>

      </div>

      {/* Main Analytics Grid */}
      <div className="analytics-grid">

        {/* Task Completion */}
        <div className="analytics-card completion-card">

          <div className="analytics-card-header">
            <div>
              <h3>Task Completion</h3>
              <p>Overall task completion rate</p>
            </div>

            <strong>{completionRate}%</strong>
          </div>

          <div className="large-progress">
            <div
              className="large-progress-fill"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>

          <div className="completion-details">

            <div>
              <span className="legend-dot completed-dot"></span>
              Completed
              <strong>{completedTasks}</strong>
            </div>

            <div>
              <span className="legend-dot progress-dot"></span>
              In Progress
              <strong>{inProgressTasks}</strong>
            </div>

            <div>
              <span className="legend-dot overdue-dot"></span>
              Overdue
              <strong>{overdueTasks}</strong>
            </div>

          </div>

        </div>

        {/* Weekly Productivity */}
        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h3>Weekly Productivity</h3>
              <p>Tasks completed per day</p>
            </div>
          </div>

          <div className="productivity-chart">

          {weeklyProductivity.map(([day, count]) => (

              <div className="chart-column" key={day}>

                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
  height: `${count === 0 ? 0 : Math.min(count * 10, 100)}%`,
}}
                  >
                    <span>{count}</span>
                  </div>
                </div>

                <small>{day}</small>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Project Performance */}
      <div className="analytics-card project-performance">

        <div className="analytics-card-header">
          <div>
            <h3>Project Performance</h3>
            <p>Progress across your projects</p>
          </div>
        </div>

        <div className="project-performance-list">

         {projects.map((project) => {

  const projectTasks = tasks.filter(
    (task) => task.project === project._id
  );

  const total = projectTasks.length;

  const completed = projectTasks.filter(
    (task) => task.status === "done"
  ).length;

  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

            return (
              <div
                className="project-performance-row"
                key={project.name}
              >

                <div className="project-performance-name">
                  <strong>{project.name}</strong>
                  <span>
                    {completed}/{total} tasks
                  </span>
                </div>

                <div className="project-performance-progress">

                  <div className="performance-bar">
                    <div
                      className="performance-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>

                  <strong>{percentage}%</strong>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Bottom Grid */}
      <div className="analytics-grid">

        {/* Team Workload */}
        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h3>Team Workload</h3>
              <p>Tasks assigned to team members</p>
            </div>

            <FiUsers />
          </div>

          <div className="team-workload-list">

            {users.map((member) => {

              const memberTasks = tasks.filter(
  (task) =>
    task.assignee &&
    task.assignee._id === member._id
);

const memberCompleted = memberTasks.filter(
  (task) => task.status === "done"
).length;

const percentage =
  memberTasks.length === 0
    ? 0
    : Math.round(
        (memberCompleted / memberTasks.length) * 100
      );

              return (
                <div
                  className="workload-row"
                  key={member.name}
                >

                  <div className="workload-member">

                   <div className="small-avatar">
  {member.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()}
</div>

                    <div>
                      <strong>{member.name}</strong>
<span>
  {memberTasks.length} assigned
</span>
                    </div>

                  </div>

                  <div className="workload-progress">

                    <div className="workload-bar">
                      <div
                        className="workload-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>

                    <span>{percentage}%</span>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* Task Distribution */}
        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h3>Task Distribution</h3>
              <p>Tasks by status</p>
            </div>
          </div>

          <div className="task-distribution">

            <div className="distribution-item">
              <div>
                <span className="distribution-dot backlog"></span>
                Backlog
              </div>
              <strong>{backlogTasks}</strong>
            </div>

            <div className="distribution-item">
              <div>
                <span className="distribution-dot todo"></span>
                To Do
              </div>
              <strong>{todoTasks}</strong>
            </div>

            <div className="distribution-item">
              <div>
                <span className="distribution-dot progress"></span>
                In Progress
              </div>
              <strong>{inProgressTasks}</strong>
            </div>

            <div className="distribution-item">
              <div>
                <span className="distribution-dot review"></span>
                In Review
              </div>
              <strong>{reviewTasks}</strong>
            </div>

            <div className="distribution-item">
              <div>
                <span className="distribution-dot done"></span>
                Done
              </div>
              <strong>{completedTasks}</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;