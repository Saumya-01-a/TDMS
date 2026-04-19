const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Get all notifications for a user (Student, Instructor, etc.)
router.get("/:userId", notificationController.getNotifications);

// Mark as read
router.put("/read/:id", notificationController.markAsRead);

// Mark all as read
router.put("/read-all/:userId", notificationController.markAllAsRead);

// Clear all
router.delete("/clear/:userId", notificationController.clearAll);

// Bulk actions
router.put("/bulk-read", notificationController.bulkRead);
router.delete("/bulk", notificationController.bulkDelete);

// Messaging Support
router.get("/search", notificationController.searchUsers);
router.post("/send", notificationController.createNotification);

module.exports = router;
