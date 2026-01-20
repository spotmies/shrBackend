const express = require("express");
const router = express.Router();
const MaterialController = require("./material.controller.ts");
const { adminOrSupervisorAuthMiddleware } = require("../../middleware/adminOrSupervisorAuth.middleware.ts");

// Get total material count (must come before /:materialId route)
router.get("/total-count", MaterialController.getTotalMaterialCount);

// Get materials by project (must come before /:materialId route)
router.get("/project/:projectId", MaterialController.getMaterialsByProject);

// Get total material count by project (must come before /:materialId route)
router.get("/project/:projectId/total-count", MaterialController.getTotalMaterialCountByProject);

// Get all materials
router.get("/", MaterialController.getAllMaterials);

// Create a new material (Admin and Supervisor only - Customers cannot create)
router.post("/", adminOrSupervisorAuthMiddleware, MaterialController.createMaterial);

// Get material by ID
router.get("/:materialId", MaterialController.getMaterialById);

// Update material (Admin and Supervisor only - Customers cannot update)
router.put("/:materialId", adminOrSupervisorAuthMiddleware, MaterialController.updateMaterial);

// Delete material (Admin and Supervisor only - Customers cannot delete)
router.delete("/:materialId", adminOrSupervisorAuthMiddleware, MaterialController.deleteMaterial);

module.exports = router;

