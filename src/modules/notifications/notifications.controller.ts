import type { Request, Response } from "express";
const NotificationServices = require("./notifications.services");

interface RequestWithUser extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    }
}

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter by unread status (true for unread only, false/omitted for all)
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 */
// GET /api/notifications
exports.getNotifications = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const unreadOnly = req.query.unreadOnly === 'true';
        const isRead = unreadOnly ? false : undefined;

        const notifications = await NotificationServices.getNotifications(userId, isRead);

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await NotificationServices.getUnreadCount(userId);

        return res.status(200).json({
            success: true,
            message: "Unread count fetched successfully",
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

// PATCH /api/notifications/:notificationId/read
exports.markAsRead = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.userId;
        const notificationId = req.params.notificationId as string;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const notification = await NotificationServices.markAsRead(notificationId, userId);

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

// PATCH /api/notifications/mark-all-read
exports.markAllAsRead = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await NotificationServices.markAllAsRead(userId);

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
