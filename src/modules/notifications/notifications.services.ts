import prisma from "../../config/prisma.client";

// Get notifications for a user (with optional read status filter)
export const getNotifications = async (userId: string, isRead?: boolean) => {
    const whereClause: any = { userId };

    if (isRead !== undefined) {
        whereClause.isRead = isRead;
    }

    const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" }
    });

    return notifications;
};

// Count unread notifications
export const getUnreadCount = async (userId: string) => {
    const count = await prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    });

    return { count };
};

// Mark a notification as read
export const markAsRead = async (notificationId: string, userId: string) => {
    // Verify ownership
    const notification = await prisma.notification.findUnique({
        where: { notificationId }
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
        throw new Error("Unauthorized access to notification");
    }

    const updatedNotification = await prisma.notification.update({
        where: { notificationId },
        data: { isRead: true }
    });

    return updatedNotification;
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: { isRead: true }
    });

    return { count: result.count, message: "All notifications marked as read" };
};

// Internal service to create notification (for use by other modules)
export const createNotification = async (userId: string, message: string, type?: string) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            message,
            type
        }
    });
    return notification;
};
