const express = require("express");
const router = express.Router();
const SupervisorController = require("./supervisor.controller.ts");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware.ts");

// Get all supervisors
router.get("/", SupervisorController.getAllSupervisors);

// Create a new supervisor (Admin only)
router.post("/", adminAuthMiddleware, SupervisorController.createSupervisor);

// Assign project to supervisor (Admin only) - Must come before /:supervisorId route
router.post("/:supervisorId/assign-project", adminAuthMiddleware, SupervisorController.assignProjectToSupervisor);

// Remove project from supervisor (Admin only) - Must come before /:supervisorId route
router.delete("/:supervisorId/remove-project", adminAuthMiddleware, SupervisorController.removeProjectFromSupervisor);

// Get assigned projects count for supervisor - Must come before /:supervisorId route
router.get("/:supervisorId/assigned-projects-count", SupervisorController.getAssignedProjectsCount);

// Get all assigned projects for supervisor - Must come before /:supervisorId route
router.get("/:supervisorId/assigned-projects", SupervisorController.getAssignedProjects);

// Get supervisor by ID
router.get("/:supervisorId", SupervisorController.getSupervisorById);

// Update supervisor (Admin only)
router.put("/:supervisorId", adminAuthMiddleware, SupervisorController.updateSupervisor);

// Delete supervisor (Admin only)
router.delete("/:supervisorId", adminAuthMiddleware, SupervisorController.deleteSupervisor);

module.exports = router;

