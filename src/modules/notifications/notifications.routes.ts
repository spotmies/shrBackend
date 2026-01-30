const express = require("express");
const router = express.Router();
const NotificationsController = require("./notifications.controller");
const { userAuthMiddleware } = require("../../middleware/userAuth.middleware");

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: User notifications management
 */

// Apply user authentication to all routes
// Note: As per requirement "only customer have access", using userAuthMiddleware.
// If later Admins/Supervisors need notifications, we might need a common middleware or separate routes.
router.use(userAuthMiddleware);

// Get all notifications (with optional filter ?unreadOnly=true)
router.get("/", NotificationsController.getNotifications);

// Get unread count
router.get("/unread-count", NotificationsController.getUnreadCount);

// Mark all as read
router.patch("/mark-all-read", NotificationsController.markAllAsRead);

// Mark single notification as read
router.patch("/:notificationId/read", NotificationsController.markAsRead);

export default router;
