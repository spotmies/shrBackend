const express = require("express");
const router = express.Router();
const UserController = require("./user.controller");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");
const { customerAuthMiddleware } = require("../../middleware/customerAuth.middleware");

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

// Approve supervisor for a user (Customer only)
router.post("/:userId/approve-supervisor", customerAuthMiddleware, UserController.approveSupervisor);

// Reject supervisor for a user (Customer only)
router.post("/:userId/reject-supervisor", customerAuthMiddleware, UserController.rejectSupervisor);

module.exports = router;

