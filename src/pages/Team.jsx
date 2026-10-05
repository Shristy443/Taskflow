import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiMail,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";


function Team() {
const [members, setMembers] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedUser, setSelectedUser] = useState("");
const [selectedDepartment, setSelectedDepartment] = useState("Engineering");
const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState("");
const [projectLoading, setProjectLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      const formattedUsers = response.data.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));

      setAllUsers(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  fetchUsers();
}, []);

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      console.log("FETCHING PROJECTS...");

      const response = await api.get("/projects");

      console.log("PROJECTS RECEIVED:", response.data);

      setProjects(response.data);

      if (response.data.length > 0) {
        setSelectedProject(response.data[0]._id);
      }
    } catch (error) {
      console.error("FETCH PROJECTS ERROR:", error);
    } finally {
      setProjectLoading(false);
    }
  };

  fetchProjects();
}, []);

useEffect(() => {
  const fetchProjectMembers = async () => {
    if (!selectedProject) {
      setMembers([]);
      return;
    }

    try {
      setLoading(true);

      console.log("FETCHING PROJECT MEMBERS...");

      const response = await api.get(`/projects/${selectedProject}`);

      console.log("PROJECT MEMBERS:", response.data.members);

      const formattedMembers = response.data.members.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || "Engineering",
        status: "Active",
        tasks: 0,
        avatar: user.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("FETCH PROJECT MEMBERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProjectMembers();
}, [selectedProject]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });
  

  const searchUsers = async (searchText) => {
  setUserSearch(searchText);

  if (!searchText.trim()) {
    setAllUsers([]);
    return;
  }

  try {
    const response = await api.get(
      `/users/search?search=${encodeURIComponent(searchText)}`
    );

    const formattedUsers = response.data.map((user) => ({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));

    setAllUsers(formattedUsers);
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);
    setAllUsers([]);
  }
};

  const addMember = async (userId) => {
  if (!selectedProject || !userId) return;

  try {
  const response = await api.post(
  `/projects/${selectedProject}/members`,
  {
    userId,
    department: selectedDepartment,
  }
);

    // Update the team list with the members returned by backend
    const formattedMembers = response.data.members.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: "Active",
      tasks: 0,
      avatar: user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }));

    setMembers(formattedMembers);

    // Close modal
    setShowAddMember(false);

    // Reset selected user if you have this state
    setSelectedUser("");
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);
    alert(error.response?.data?.message || "Failed to add member");
  }
};
  const deleteMember = async (userId) => {
  try {
    await api.delete(`/projects/${selectedProject}/members`, {
      data: {
        userId,
      },
    });

    setMembers((prev) =>
      prev.filter((member) => member.id !== userId)
    );

    setSelectedMember(null);
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);
    alert(
      error.response?.data?.message ||
        "Failed to remove member"
    );
  }
};

  return (
    <div className="team-page">

      {/* Header */}
     <div className="page-header">
  <div>
    <h1>Team</h1>
    <p>Manage your team members</p>
  </div>

  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
    <select
      value={selectedProject}
      onChange={(e) => setSelectedProject(e.target.value)}
      className="form-select"
      style={{ width: "220px" }}
      disabled={projectLoading}
    >
      <option value="">
        {projectLoading ? "Loading projects..." : "Select Project"}
      </option>

      {projects.map((project) => (
        <option key={project._id} value={project._id}>
          {project.name}
        </option>
      ))}
    </select>

    <button
      className="btn btn-primary"
      onClick={() => {
  setSelectedDepartment("Engineering");
  setShowAddMember(true);
}}
      disabled={!selectedProject}
    >
      <FiPlus />
      Add Member
    </button>
  </div>
</div>

      {/* Stats */}
      <div className="team-stats">

        <div className="team-stat-card">
          <div className="team-stat-icon">
            <FiUserCheck />
          </div>

          <div>
            <span>Total Members</span>
            <h3>{members.length}</h3>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="team-stat-icon">
            <FiUserCheck />
          </div>

          <div>
            <span>Active Members</span>
            <h3>
              {members.filter((m) => m.status === "Active").length}
            </h3>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="team-stat-icon">
            <FiMail />
          </div>

          <div>
            <span>Developers</span>
            <h3>
              {members.filter((m) => m.role === "Developer").length}
            </h3>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="team-stat-icon">
            <FiUserCheck />
          </div>

          <div>
            <span>Total Tasks</span>
            <h3>
              {members.reduce((total, member) => total + member.tasks, 0)}
            </h3>
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="team-toolbar">

        <div className="team-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
        </select>

      </div>

      {/* Team Table */}
      <div className="team-table-card">
        {loading ? (
  <div className="empty-team">
    Loading team members...
  </div>
) : (

        <div className="table-responsive">

          <table className="team-table">

            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredMembers.map((member) => (

                <tr key={member.id}>

                  <td>
                    <div className="member-info">

                      <div className="member-avatar">
                        {member.avatar}
                      </div>

                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.email}</span>
                      </div>

                    </div>
                  </td>

                  <td>
                    <span className="role-badge">
                      {member.role}
                    </span>
                  </td>

                  <td>{member.department}</td>

                  <td>
                    <span
                      className={`member-status ${member.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      <span className="status-dot"></span>
                      {member.status}
                    </span>
                  </td>

                  <td>
                    <strong>{member.tasks}</strong>
                  </td>

                  <td>

                    <div className="member-actions">

                      <button
                        title="View"
                        onClick={() => setSelectedMember(member)}
                      >
                        <FiMoreVertical />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredMembers.length === 0 && (
            <div className="empty-team">
              No members found.
            </div>
          )}
        

        </div>
)}
      </div>
    

     {/* Add Member Modal */}
{showAddMember && (
  <div
    className="modal-overlay"
    onClick={() => setShowAddMember(false)}
  >
    <div
      className="task-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <h2>Add Team Member</h2>
          <p>Add a new member to your project.</p>
        </div>

        <button
          className="modal-close"
          onClick={() => setShowAddMember(false)}
        >
          ×
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (!selectedUser) {
            alert("Please select a user");
            return;
          }

          addMember(selectedUser);
        }}
      >
        <div className="form-group">
          <label>Team Member</label>

          <input
  type="text"
  className="form-control"
  placeholder="Search by name or email..."
  value={userSearch}
  onChange={(e) => {
    setSelectedUser("");
    searchUsers(e.target.value);
  }}
/>

{userSearch.trim() && (
  <div
    style={{
      marginTop: "8px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      maxHeight: "180px",
      overflowY: "auto",
    }}
  >
    {allUsers.length === 0 ? (
      <div style={{ padding: "10px", color: "#777" }}>
        No users found
      </div>
    ) : (
      allUsers.map((user) => {
        const alreadyMember = members.some(
          (member) => member.id === user._id
        );

        return (
          <div
            key={user._id}
            onClick={() => {
              if (!alreadyMember) {
                setSelectedUser(user._id);
                setUserSearch(`${user.name} (${user.email})`);
              }
            }}
            style={{
              padding: "10px",
              cursor: alreadyMember ? "not-allowed" : "pointer",
              opacity: alreadyMember ? 0.5 : 1,
              borderBottom: "1px solid #eee",
            }}
          >
            <strong>{user.name}</strong>
            <div style={{ fontSize: "12px", color: "#777" }}>
              {user.email}
              {alreadyMember ? " — Already a member" : ""}
            </div>
          </div>
        );
      })
    )}
  </div>
)}
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={
              allUsers.find((user) => user._id === selectedUser)?.email || ""
            }
            readOnly
            placeholder="Select a user"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Role</label>

            <input
              type="text"
              value={
                allUsers.find((user) => user._id === selectedUser)?.role || ""
              }
              readOnly
              placeholder="User role"
            />
          </div>

          <div className="form-group">
  <label>Department</label>

  <select
    className="form-select"
    value={selectedDepartment}
    onChange={(e) => setSelectedDepartment(e.target.value)}
  >
    <option value="Engineering">Engineering</option>
    <option value="Product">Product</option>
    <option value="Design">Design</option>
    <option value="Marketing">Marketing</option>
    <option value="Sales">Sales</option>
    <option value="Human Resources">Human Resources</option>
    <option value="Finance">Finance</option>
    <option value="Operations">Operations</option>
    <option value="Customer Support">Customer Support</option>
    <option value="IT">IT</option>
    <option value="Quality Assurance">Quality Assurance</option>
    <option value="Administration">Administration</option>
    <option value="Other">Other</option>
  </select>
</div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              
setShowAddMember(false);
setSelectedUser("");
setUserSearch("");
setAllUsers([]);
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-btn"
            disabled={!selectedUser}
          >
            Add Member
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="task-modal member-details-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h2>Member Details</h2>
                <p>Manage member information.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedMember(null)}
              >
                ×
              </button>

            </div>

            <div className="member-detail-profile">

              <div className="large-avatar">
                {selectedMember.avatar}
              </div>

              <div>
                <h3>{selectedMember.name}</h3>
                <p>{selectedMember.email}</p>
              </div>

            </div>

            <div className="member-detail-grid">

              <div>
                <span>Role</span>
                <strong>{selectedMember.role}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{selectedMember.department}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedMember.status}</strong>
              </div>

              <div>
                <span>Assigned Tasks</span>
                <strong>{selectedMember.tasks}</strong>
              </div>

            </div>

            <div className="member-detail-actions">

              <button className="secondary-btn">
                <FiEdit2 />
                Edit Member
              </button>

              <button
                className="danger-btn"
                onClick={() => deleteMember(selectedMember.id)}
              >
                <FiTrash2 />
                Remove Member
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Team;