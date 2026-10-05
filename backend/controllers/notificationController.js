const Notification = require("../models/notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("task", "title")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};