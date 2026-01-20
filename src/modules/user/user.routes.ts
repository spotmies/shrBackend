const express = require("express");
const router = express.Router();
const UserController = require("./user.controller.ts");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware.ts");

// Get all users
router.get("/", UserController.getAllUsers);

// Create a new user (Admin only)
router.post("/", adminAuthMiddleware, UserController.createUser);

// Get user by ID
router.get("/:userId", UserController.getuserById);

// Update user (Admin only)
router.put("/:userId", adminAuthMiddleware, UserController.updateUser);

// Delete user (Admin only)
router.delete("/:userId", adminAuthMiddleware, UserController.deleteUser);

module.exports = router;
