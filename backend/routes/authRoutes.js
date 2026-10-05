const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfile,
   changePassword,
     getNotificationSettings,
  updateNotificationSettings,
  getPreferences,
updatePreferences,
} = require("../controllers/authController");

const  protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.get(
  "/notification-settings",
  protect,
  getNotificationSettings
);

router.put(
  "/notification-settings",
  protect,
  updateNotificationSettings
);

router.get(
  "/preferences",
  protect,
  getPreferences
);

router.put(
  "/preferences",
  protect,
  updatePreferences
);
module.exports = router;