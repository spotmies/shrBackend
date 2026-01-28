const express = require("express");
const router = express.Router();
const MessagesController = require("./messages.controller");
import { commonAuthMiddleware } from "../../middleware/commonAuth.middleware";

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: Messaging system endpoints
 */

// Apply common auth middleware to all routes
router.use(commonAuthMiddleware);

// POST - Send a message
router.post("/", MessagesController.sendMessage);

// GET - Get my messages
router.get("/", MessagesController.getMyMessages);

// GET - Get unread count
router.get("/unread/count", MessagesController.getUnreadCount);

// GET - Get messages by project
router.get("/project/:projectId", MessagesController.getMessagesByProject);

// PATCH - Mark as read
router.patch("/:messageId/read", MessagesController.markAsRead);

module.exports = router;
