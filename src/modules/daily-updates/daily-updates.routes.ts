const express = require("express");
const router = express.Router();
const DailyUpdatesController = require("./daily-updates.controller.ts");
const upload = require("../../config/multer.config").default;
const { supervisorAuthMiddleware } = require("../../middleware/supervisorAuth.middleware.ts");

/**
 * @swagger
 * tags:
 *   - name: Daily Updates
 *     description: Daily construction updates management endpoints
 */

// Get daily updates by stage (must come before /:dailyUpdateId route)
router.get("/stage/:constructionStage", DailyUpdatesController.getDailyUpdatesByStage);

// Get all daily updates
router.get("/", DailyUpdatesController.getAllDailyUpdates);

// Create a new daily update (Supervisor only)
// Matches POST /api/daily-updates
// Body must include 'constructionStage'. Optional: 'image', 'video'
router.post("/", supervisorAuthMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), DailyUpdatesController.createDailyUpdate);

// Get daily update by ID
router.get("/:dailyUpdateId", DailyUpdatesController.getDailyUpdateById);

// Download daily update image
router.get("/:dailyUpdateId/image", DailyUpdatesController.downloadImage);

// Download daily update video
router.get("/:dailyUpdateId/video", DailyUpdatesController.downloadVideo);

// Update daily update (Supervisor only)
// Matches PUT /api/daily-updates/:dailyUpdateId
router.put("/:dailyUpdateId", supervisorAuthMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), DailyUpdatesController.updateDailyUpdate);

// Delete daily update (Supervisor only)
router.delete("/:dailyUpdateId", supervisorAuthMiddleware, DailyUpdatesController.deleteDailyUpdate);

module.exports = router;

