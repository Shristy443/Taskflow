import {
  FiGrid,
  FiCheckSquare,
  FiFolder,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">T</div>
        <span>TaskFlow</span>
      </div>

      <div className="workspace">
        <small>WORKSPACE</small>

        <div
  className="workspace-selector"
  onClick={() => {
    window.location.href = "/settings";
  }}
  style={{ cursor: "pointer" }}
>
  <div className="workspace-avatar">S</div>
  <span>My Workspace</span>
  <span className="ms-auto">⌄</span>
</div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MAIN</p>

        <a href="/dashboard" className="nav-item active">
          <FiGrid />
          <span>Dashboard</span>
        </a>

        <a href="/tasks" className="nav-item">
          <FiCheckSquare />
          <span>My Tasks</span>
        </a>

        <a href="/projects" className="nav-item">
          <FiFolder />
          <span>Projects</span>
        </a>

        <a href="/calendar" className="nav-item">
          <FiCalendar />
          <span>Calendar</span>
        </a>

        <p className="nav-title">WORKSPACE</p>

        <a href="/team" className="nav-item">
          <FiUsers />
          <span>Team</span>
        </a>

        <a href="/analytics" className="nav-item">
          <FiBarChart2 />
          <span>Analytics</span>
        </a>

        <p className="nav-title">OTHER</p>

        <a href="/settings" className="nav-item">
          <FiSettings />
          <span>Settings</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;