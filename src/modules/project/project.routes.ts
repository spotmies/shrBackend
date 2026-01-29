const express = require("express");
const router = express.Router();

const projectController = require("./project.controller");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */


router.post("/createproject", adminAuthMiddleware, projectController.createProject);


router.put("/updateproject/:projectId", adminAuthMiddleware, projectController.updateProject);


router.delete("/deleteproject/:projectId", adminAuthMiddleware, projectController.deleteProject);


router.get("/getproject/:projectId", projectController.getProjectById);


router.get("/getallprojects", projectController.getAllProjects);

module.exports = router;

