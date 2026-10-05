const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("GET ME ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name;
    user.email = email;
    user.bio = bio || "";

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "notificationSettings"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(
      user.notificationSettings || {
        taskAssigned: true,
        taskCompleted: true,
        projectUpdates: true,
        comments: true,
        emailNotifications: false,
      }
    );
  } catch (error) {
    console.error("GET NOTIFICATION SETTINGS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch notification settings",
    });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const {
      taskAssigned,
      taskCompleted,
      projectUpdates,
      comments,
      emailNotifications,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.notificationSettings = {
      taskAssigned,
      taskCompleted,
      projectUpdates,
      comments,
      emailNotifications,
    };

    await user.save();

    res.json({
      message: "Notification settings updated successfully",
      notificationSettings: user.notificationSettings,
    });
  } catch (error) {
    console.error("UPDATE NOTIFICATION SETTINGS ERROR:", error);

    res.status(500).json({
      message: "Failed to update notification settings",
    });
  }
};

const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(
      user.preferences || {
        language: "English",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        startWeek: "Monday",
      }
    );
  } catch (error) {
    console.error("GET PREFERENCES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch preferences",
    });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const {
      language,
      timezone,
      dateFormat,
      startWeek,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.preferences = {
      language,
      timezone,
      dateFormat,
      startWeek,
    };

    await user.save();

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("UPDATE PREFERENCES ERROR:", error);

    res.status(500).json({
      message: "Failed to update preferences",
    });
  }
};

exports.getPreferences = getPreferences;
exports.updatePreferences = updatePreferences;
exports.getMe = getMe;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.getNotificationSettings = getNotificationSettings;
exports.updateNotificationSettings = updateNotificationSettings;