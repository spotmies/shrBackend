const express = require("express");
const router = express.Router();
const authController = require("./auth.controller.ts");

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Admin authentication endpoints
 */

// Admin login route
router.post("/admin/login", authController.adminLogin);

// User login route (for regular users only)
router.post("/user/login", authController.userLogin);

// Supervisor login route (for supervisors only)
router.post("/supervisor/login", authController.supervisorLogin);

module.exports = router;