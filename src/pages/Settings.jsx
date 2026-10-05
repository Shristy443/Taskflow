import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FiUser,
  FiBell,
  FiLock,
  FiMonitor,
  FiUsers,
  FiDatabase,
  FiSave,
} from "react-icons/fi";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
const [profileLoading, setProfileLoading] = useState(true);
const [savingProfile, setSavingProfile] = useState(false);
const [notificationLoading, setNotificationLoading] = useState(true);
const [savingNotifications, setSavingNotifications] = useState(false); 
const [preferencesLoading, setPreferencesLoading] = useState(true);
const [savingPreferences, setSavingPreferences] = useState(false);
const [workspaceLoading, setWorkspaceLoading] = useState(true);
const [savingWorkspace, setSavingWorkspace] = useState(false);

const [workspace, setWorkspace] = useState({
  name: "",
  url: "",
  description: "",
});
const [profile, setProfile] = useState({
  name: "",
  email: "",
  role: "",
  bio: "",
});


   useEffect(() => {
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);

      const response = await api.get("/auth/me");

      setProfile({
        name: response.data.name || "",
        email: response.data.email || "",
        role: response.data.role || "",
        bio: response.data.bio || "",
      });
    } catch (error) {
      console.error("FETCH PROFILE ERROR:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  fetchProfile();
}, []);

useEffect(() => {
  const fetchNotificationSettings = async () => {
    try {
      setNotificationLoading(true);

      const response = await api.get("/auth/notification-settings");

      setNotifications({
        taskAssigned: response.data.taskAssigned ?? true,
        taskCompleted: response.data.taskCompleted ?? true,
        projectUpdates: response.data.projectUpdates ?? true,
        comments: response.data.comments ?? true,
        emailNotifications: response.data.emailNotifications ?? false,
      });
    } catch (error) {
      console.error("FETCH NOTIFICATION SETTINGS ERROR:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  fetchNotificationSettings();
}, []);

useEffect(() => {
  const fetchPreferences = async () => {
    try {
      setPreferencesLoading(true);

      const response = await api.get("/auth/preferences");

      setPreferences({
        language: response.data.language ?? "English",
        timezone: response.data.timezone ?? "Asia/Kolkata",
        dateFormat: response.data.dateFormat ?? "DD/MM/YYYY",
        startWeek: response.data.startWeek ?? "Monday",
      });
    } catch (error) {
      console.error("FETCH PREFERENCES ERROR:", error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  fetchPreferences();
}, []);
useEffect(() => {
  const fetchWorkspace = async () => {
    try {
      setWorkspaceLoading(true);

      const response = await api.get("/workspace");

      setWorkspace({
        name: response.data.name || "",
        url: response.data.url || "",
        description: response.data.description || "",
      });
    } catch (error) {
      console.error("FETCH WORKSPACE ERROR:", error);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  fetchWorkspace();
}, []);

const saveNotificationSettings = async () => {
  try {
    setSavingNotifications(true);

    await api.put("/auth/notification-settings", notifications);

    alert("Notification settings saved successfully!");
  } catch (error) {
    console.error("SAVE NOTIFICATION SETTINGS ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to save notification settings"
    );
  } finally {
    setSavingNotifications(false);
  }
};

const savePreferences = async () => {
  try {
    setSavingPreferences(true);

    const response = await api.put(
      "/auth/preferences",
      preferences
    );

    console.log("PREFERENCES SAVED:", response.data);

    if (response.data.preferences) {
      setPreferences(response.data.preferences);
    }

    alert("Preferences saved successfully!");
  } catch (error) {
    console.error("SAVE PREFERENCES ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to save preferences"
    );
  } finally {
    setSavingPreferences(false);
  }
};


const [passwords, setPasswords] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const [changingPassword, setChangingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
  taskAssigned: true,
  taskCompleted: true,
  projectUpdates: true,
  comments: true,
  emailNotifications: false,
});

  const [preferences, setPreferences] = useState({
    language: "English",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    startWeek: "Monday",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "security", label: "Security", icon: FiLock },
    { id: "preferences", label: "Preferences", icon: FiMonitor },
    { id: "workspace", label: "Workspace", icon: FiUsers },
  ];

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };
const handlePasswordChange = (e) => {
  setPasswords({
    ...passwords,
    [e.target.name]: e.target.value,
  });
};
const handleUpdatePassword = async () => {
  if (
    !passwords.currentPassword ||
    !passwords.newPassword ||
    !passwords.confirmPassword
  ) {
    alert("Please fill all password fields.");
    return;
  }

  if (passwords.newPassword !== passwords.confirmPassword) {
    alert("New password and confirm password do not match.");
    return;
  }

  if (passwords.newPassword.length < 6) {
    alert("New password must be at least 6 characters.");
    return;
  }

  try {
    setChangingPassword(true);

    const response = await api.put("/auth/change-password", {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    alert(response.data.message);

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to update password"
    );
  } finally {
    setChangingPassword(false);
  }
};
 const handleNotificationChange = (e) => {
  setNotifications({
    ...notifications,
    [e.target.name]: e.target.checked,
  });
};

  const handlePreferenceChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };

 const handleSave = async () => {
  try {
    setSavingProfile(true);

    const response = await api.put("/auth/profile", {
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
    });

    setProfile({
      ...profile,
      name: response.data.name,
      email: response.data.email,
      bio: response.data.bio || "",
    });

    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
    );

    alert("Profile updated successfully!");
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    alert(
      error.response?.data?.message ||
      "Failed to update profile"
    );
  } finally {
    setSavingProfile(false);
  }
};

const handleWorkspaceChange = (e) => {
  setWorkspace({
    ...workspace,
    [e.target.name]: e.target.value,
  });
};

const saveWorkspace = async () => {
  try {
    setSavingWorkspace(true);

    const response = await api.put("/workspace", workspace);

    setWorkspace({
      name: response.data.workspace.name,
      url: response.data.workspace.url,
      description: response.data.workspace.description,
    });

    alert("Workspace settings saved successfully!");
  } catch (error) {
    console.error("SAVE WORKSPACE ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Failed to save workspace settings"
    );
  } finally {
    setSavingWorkspace(false);
  }
};

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences and workspace settings.</p>
        </div>

       <button
  className="primary-btn"
  onClick={handleSave}
  disabled={savingProfile}
>
  <FiSave />
  {savingProfile ? "Saving..." : "Save Changes"}
</button>
      </div>

      <div className="settings-layout">

        {/* Sidebar */}
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`settings-tab ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="settings-content">

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Profile Information</h2>
                  <p>Update your personal information.</p>
                </div>
              </div>

              <div className="profile-preview">
                <div className="large-avatar">
  {profile.name
    ? profile.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"}
</div>

                <div>
                  <h3>{profile.name}</h3>
                  <p>{profile.email}</p>

                  <button className="secondary-btn">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="settings-form">

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                  />
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={profile.bio}
                    onChange={handleProfileChange}
                  />
                </div>

              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Notification Settings</h2>
                  <p>Choose which notifications you want to receive.</p>
                </div>
              </div>

                            <div className="settings-form">
                {/* Task Assigned */}
                <div className="notification-item">
                  <div>
                    <h6>Task Assigned</h6>
                    <p>Receive notifications when a task is assigned to you.</p>
                  </div>

                  <input
                    type="checkbox"
                    name="taskAssigned"
                    checked={notifications.taskAssigned}
                    onChange={handleNotificationChange}
                  />
                </div>

                {/* Task Completed */}
                <div className="notification-item">
                  <div>
                    <h6>Task Completed</h6>
                    <p>Receive notifications when a task is completed.</p>
                  </div>

                  <input
                    type="checkbox"
                    name="taskCompleted"
                    checked={notifications.taskCompleted}
                    onChange={handleNotificationChange}
                  />
                </div>

                {/* Project Updates */}
                <div className="notification-item">
                  <div>
                    <h6>Project Updates</h6>
                    <p>Receive notifications about project updates.</p>
                  </div>

                  <input
                    type="checkbox"
                    name="projectUpdates"
                    checked={notifications.projectUpdates}
                    onChange={handleNotificationChange}
                  />
                </div>

                {/* Comments */}
                <div className="notification-item">
                  <div>
                    <h6>Comments</h6>
                    <p>Receive notifications when someone comments on your task.</p>
                  </div>

                  <input
                    type="checkbox"
                    name="comments"
                    checked={notifications.comments}
                    onChange={handleNotificationChange}
                  />
                </div>

                {/* Email Notifications */}
                <div className="notification-item">
                  <div>
                    <h6>Email Notifications</h6>
                    <p>Receive important notifications through email.</p>
                  </div>

                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                </div>

                {/* Save Button */}
                <div className="settings-actions">
                  <button
                    className="btn btn-primary"
                    onClick={saveNotificationSettings}
                    disabled={savingNotifications || notificationLoading}
                  >
                    {savingNotifications
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
                

             
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Security</h2>
                  <p>Manage your password and account security.</p>
                </div>
              </div>

              <div className="form-group full-width">
  <label>Current Password</label>
  <input
    type="password"
    name="currentPassword"
    placeholder="Enter current password"
    value={passwords.currentPassword}
    onChange={handlePasswordChange}
  />
</div>

<div className="form-group">
  <label>New Password</label>
  <input
    type="password"
    name="newPassword"
    placeholder="Enter new password"
    value={passwords.newPassword}
    onChange={handlePasswordChange}
  />
</div>

<div className="form-group">
  <label>Confirm Password</label>
  <input
    type="password"
    name="confirmPassword"
    placeholder="Confirm new password"
    value={passwords.confirmPassword}
    onChange={handlePasswordChange}
  />
</div>

             <button
  className="primary-btn"
  onClick={handleUpdatePassword}
  disabled={changingPassword}
>
  {changingPassword ? "Updating..." : "Update Password"}
</button>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>
                  Permanently delete your TaskFlow account and all associated data.
                </p>

                <button className="danger-btn">
                  Delete Account
                </button>
              </div>
            </div>
          )}
          

          {/* Preferences */}
          {activeTab === "preferences" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Preferences</h2>
                  <p>Customize how TaskFlow works for you.</p>
                </div>
              </div>

              <div className="settings-form">

                <div className="form-group">
                  <label>Language</label>
                  <select
                    name="language"
                    value={preferences.language}
                    onChange={handlePreferenceChange}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    name="timezone"
                    value={preferences.timezone}
                    onChange={handlePreferenceChange}
                  >
                    <option value="Asia/Kolkata">
                      India Standard Time (IST)
                    </option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">
                      Eastern Time
                    </option>
                    <option value="Europe/London">
                      London
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Format</label>
                  <select
                    name="dateFormat"
                    value={preferences.dateFormat}
                    onChange={handlePreferenceChange}
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Week Starts On</label>
                  <select
                    name="startWeek"
                    value={preferences.startWeek}
                    onChange={handlePreferenceChange}
                  >
                    <option>Monday</option>
                    <option>Sunday</option>
                  </select>
                </div>

                         </div>

              <div className="settings-actions">
                <button
                  className="btn btn-primary"
                  onClick={savePreferences}
                  disabled={savingPreferences || preferencesLoading}
                >
                  {savingPreferences ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          )}

          {/* Workspace */}
          {activeTab === "workspace" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Workspace Settings</h2>
                  <p>Manage your TaskFlow workspace.</p>
                </div>
              </div>

              <div className="settings-form">

                <div className="form-group">
                  <label>Workspace Name</label>
                <input
  type="text"
  name="name"
  value={workspace.name}
  onChange={handleWorkspaceChange}
  disabled={workspaceLoading}
/>
                </div>
          

                <div className="form-group">
                  <label>Workspace URL</label>
                 <input
  type="text"
  name="url"
  value={workspace.url}
  onChange={handleWorkspaceChange}
  disabled={workspaceLoading}
/>
                </div>

                <div className="form-group full-width">
                  <label>Workspace Description</label>
                <textarea
  name="description"
  rows="4"
  value={workspace.description}
  onChange={handleWorkspaceChange}
  disabled={workspaceLoading}
/>
                </div>

<div className="settings-actions">
  <button
    className="btn btn-primary"
    onClick={saveWorkspace}
    disabled={savingWorkspace || workspaceLoading}
  >
    {savingWorkspace ? "Saving..." : "Save Changes"}
  </button>
</div>

              </div>

              <div className="workspace-info">
                <div className="workspace-info-icon">
                  <FiDatabase />
                </div>

                <div>
                  <h3>Workspace Storage</h3>
                  <p>128 MB of 1 GB used</p>

                  <div className="storage-bar">
                    <div className="storage-progress"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;