const express = require("express");
const router = express.Router();

const projectController = require("./project.controller");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");

// Admin only routes
router.post("/createproject", adminAuthMiddleware, projectController.createProject);
router.put("/updateproject/:projectId", adminAuthMiddleware, projectController.updateProject);
router.delete("/deleteproject/:projectId", adminAuthMiddleware, projectController.deleteProject);

// Public routes (can be accessed by anyone)
router.get("/getproject/:projectId", projectController.getProjectById);
router.get("/getallprojects", projectController.getAllProjects);

module.exports = router;

