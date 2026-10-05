const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "developer", "designer", "member"],
      default: "member",
    },

    avatar: {
      type: String,
      default: "",
    },
    bio: {
  type: String,
  default: "",
},
department: {
  type: String,
  default: "Engineering",
},
notificationSettings: {
  taskAssigned: { type: Boolean, default: true },
  taskCompleted: { type: Boolean, default: true },
  projectUpdates: { type: Boolean, default: true },
  comments: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: false },
},
preferences: {
  language: { type: String, default: "English" },
  timezone: { type: String, default: "Asia/Kolkata" },
  dateFormat: { type: String, default: "DD/MM/YYYY" },
  startWeek: { type: String, default: "Monday" },
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);