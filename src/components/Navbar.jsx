import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FiSearch,
  FiBell,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";

function Navbar() {
 const [user, setUser] = useState(null);
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [showSearchResults, setShowSearchResults] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
useEffect(() => {
  const fetchSearchData = async () => {
    try {
      const response = await api.get("/projects");

      const projects = (response.data || []).map((project) => ({
        id: project._id,
        name: project.name,
        type: "Project",
        url: `/projects/${project._id}`,
      }));

      setSearchResults(projects);

      console.log("SEARCH PROJECTS:", projects);
    } catch (error) {
      console.error("SEARCH PROJECTS ERROR:", error);
    }
  };

  fetchSearchData();
}, []);
const filteredSearchResults = searchResults.filter((item) =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
);
 useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data || []);
    } catch (error) {
      console.error("FETCH NOTIFICATIONS ERROR:", error);
    }
  };

  fetchNotifications();
}, []);

  return (
    <header className="top-navbar">
      <div className="search-box">
  <FiSearch className="search-icon" />
  <input
  type="text"
  placeholder="Search tasks, projects..."
  value={searchQuery}
 onChange={(e) => {
  const value = e.target.value;

  setSearchQuery(value);

  if (value.trim()) {
    setShowSearchResults(true);
  } else {
    setShowSearchResults(false);
  }
}}
/>
  <button
  type="button"
  className="search-button"
  onClick={async () => {
  try {
    const response = await api.get("/projects");

    const projects = (response.data || []).map((project) => ({
      id: project._id,
      name: project.name,
      type: "Project",
      url: `/projects/${project._id}`,
    }));

    setSearchResults(projects);
    setShowSearchResults(true);
  } catch (error) {
    console.error("SEARCH REFRESH ERROR:", error);
  }
}}
>
  Search
</button>
</div>
{showSearchResults && searchQuery.trim() && (
  <div className="search-results">
    {filteredSearchResults.length > 0 ? (
      filteredSearchResults.slice(0, 8).map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="search-result-item"
          onClick={() => {
            window.location.href = item.url;
          }}
        >
          <div>
            <strong>{item.name}</strong>
            <small>{item.type}</small>
          </div>
        </div>
      ))
    ) : (
      <div className="search-no-results">
        No matching projects or tasks found.
      </div>
    )}
  </div>
)}

      <div className="navbar-actions">
       <button
  className="create-btn"
  onClick={() => {
    window.location.href = "/projects";
  }}
>
  <FiPlus />
  <span>Create</span>
</button>

        <button
  className="icon-btn notification-btn"
  onClick={() => setShowNotifications(!showNotifications)}
>
          <FiBell />
          <span className="notification-dot"></span>
        </button>
       {showNotifications && (
  <div className="notification-panel">
    <div className="notification-header">
      <strong>Notifications</strong>
    </div>

    {notifications.length > 0 ? (
      notifications.map((notification) => (
        <div
          key={notification._id}
          className={`notification-item ${
            notification.read ? "" : "unread"
          }`}
        >
          <strong>{notification.title}</strong>
          <span>{notification.message}</span>
        </div>
      ))
    ) : (
      <div className="notification-item">
        <strong>Welcome to TaskFlow!</strong>
        <span>You are all caught up.</span>
      </div>
    )}
  </div>
)}

        <div
  className="profile"
  onClick={() => {
    window.location.href = "/settings";
  }}
  style={{ cursor: "pointer" }}
>
          <div className="profile-avatar">
  {user?.name?.charAt(0).toUpperCase() || "U"}
</div>

          <div className="profile-info">
            <strong>{user?.name || "User"}</strong>
<small>{user?.role || "Member"}</small>
          </div>

          <FiChevronDown />
        </div>
      </div>
    </header>
  );
}

export default Navbar;