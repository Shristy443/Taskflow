import { useEffect, useState } from "react";
import api from "../api/axios";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch all projects first, then fetch tasks for each project
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const projectResponse = await api.get("/projects");
        const projects = projectResponse.data;

        let allTasks = [];

        for (const project of projects) {
          const response = await api.get(
            `/tasks/project/${project._id}`
          );

          const projectTasks = response.data.map((task) => ({
            ...task,
            projectName: project.name,
          }));

          allTasks = [...allTasks, ...projectTasks];
        }

        setTasks(allTasks);
      } catch (error) {
        console.error("FETCH CALENDAR TASKS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Get days of current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const today = new Date();

  const getTasksForDate = (day) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);

      return (
        taskDate.getFullYear() === year &&
        taskDate.getMonth() === month &&
        taskDate.getDate() === day
      );
    });
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>View your tasks and deadlines.</p>
        </div>

        <div className="calendar-navigation">

          <button
            className="secondary-btn"
            onClick={previousMonth}
          >
            <FiChevronLeft />
          </button>

          <h2>
            {monthName} {year}
          </h2>

          <button
            className="secondary-btn"
            onClick={nextMonth}
          >
            <FiChevronRight />
          </button>

        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="empty-state">
          Loading calendar...
        </div>
      ) : (
        <div className="calendar-container">

          {/* Week names */}
          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar */}
          <div className="calendar-grid">

            {calendarDays.map((day, index) => {

              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day empty"
                  />
                );
              }

              const dayTasks = getTasksForDate(day);

              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;

              return (
                <div
                  key={day}
                  className={`calendar-day ${
                    isToday ? "today" : ""
                  }`}
                >

                  <div className="calendar-date">
                    {day}
                  </div>

                  <div className="calendar-tasks">

                    {dayTasks.map((task) => (
                      <div
                        key={task._id}
                        className={`calendar-task priority-${task.priority}`}
                        title={`${task.title} - ${task.projectName}`}
                      >
                        <strong>{task.title}</strong>

                        <small>
                          {task.projectName}
                        </small>
                      </div>
                    ))}

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

    </div>
  );
}

export default Calendar;