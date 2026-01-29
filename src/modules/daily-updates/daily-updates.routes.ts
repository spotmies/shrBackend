const express = require("express");
const router = express.Router();
const DailyUpdatesController = require("./daily-updates.controller");
const upload = require("../../config/multer.config").default;
const { supervisorAuthMiddleware } = require("../../middleware/supervisorAuth.middleware");
const { userAuthMiddleware } = require("../../middleware/userAuth.middleware");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");

/**
 * @swagger
 * tags:
 *   - name: Daily Updates
 *     description: Daily construction updates management endpoints
 */


// Get daily updates by status for user (Authenticated Customer) - Must come before /:dailyUpdateId
router.get("/user/status/:status", userAuthMiddleware, DailyUpdatesController.getDailyUpdatesByStatusForUser);

// Get all daily updates
router.get("/", DailyUpdatesController.getAllDailyUpdates);

const { adminOrSupervisorAuthMiddleware } = require("../../middleware/adminOrSupervisorAuth.middleware");

// Get daily updates for assigned projects (Authenticated Supervisor) - Must come before /:dailyUpdateId
router.get("/supervisor/assigned-projects", supervisorAuthMiddleware, DailyUpdatesController.getDailyUpdatesForSupervisor);

// Get construction timeline for a project (Admin or Supervisor)
router.get("/project/:projectId/timeline", adminOrSupervisorAuthMiddleware, DailyUpdatesController.getConstructionTimeline);

// Create a new daily update (Supervisor only)
// Matches POST /api/daily-updates
// Body must include 'constructionStage'. Optional: 'image', 'video'
router.post("/", supervisorAuthMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), DailyUpdatesController.createDailyUpdate);

// Download daily update image
// Must come before /:dailyUpdateId if using regex, but here it's fine as "image" is literal
router.get("/:dailyUpdateId/image", DailyUpdatesController.downloadImage);

// Download daily update video
router.get("/:dailyUpdateId/video", DailyUpdatesController.downloadVideo);

// Approve daily update (Authenticated Customer)
router.put("/:dailyUpdateId/approve", userAuthMiddleware, DailyUpdatesController.approveDailyUpdate);

// Reject daily update (Authenticated Customer)
router.put("/:dailyUpdateId/reject", userAuthMiddleware, DailyUpdatesController.rejectDailyUpdate);

// Get daily update by ID (General access, maybe restricted later?)
router.get("/:dailyUpdateId", DailyUpdatesController.getDailyUpdateById);

// Update daily update (Supervisor only)
// Matches PUT /api/daily-updates/:dailyUpdateId
router.put("/:dailyUpdateId", supervisorAuthMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), DailyUpdatesController.updateDailyUpdate);

// Delete daily update (Supervisor only)
router.delete("/:dailyUpdateId", supervisorAuthMiddleware, DailyUpdatesController.deleteDailyUpdate);

module.exports = router;
