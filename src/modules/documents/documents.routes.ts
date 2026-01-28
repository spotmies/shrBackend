const express = require("express");
const router = express.Router();
const DocumentController = require("./documents.controller");
const upload = require("../../config/multer.config").default;
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");

/**
 * @swagger
 * tags:
 *   - name: Documents
 *     description: Document management endpoints for Agreements, plans, permits, and others
 */

// POST - Create Document (Admin only)
router.post("/", adminAuthMiddleware, upload.single("file"), DocumentController.createDocument);

// GET - Get All Documents (with optional filters: ?documentType=Agreement&projectId=uuid)
router.get("/", DocumentController.getAllDocuments);

// GET - Get Document Counts by Type
router.get("/counts/by-type", DocumentController.getDocumentCountsByType);

// GET - Get Documents by Type (Agreement, plans, permit, others)
router.get("/type/:documentType", DocumentController.getDocumentsByType);

// GET - Get Documents by Project ID
router.get("/project/:projectId", DocumentController.getDocumentsByProject);

// GET - Get Document by ID
router.get("/:documentId", DocumentController.getDocumentById);

// GET - Download Document File
router.get("/:documentId/download", DocumentController.downloadDocument);

// PUT - Update Document (Admin only)
router.put("/:documentId", adminAuthMiddleware, upload.single("file"), DocumentController.updateDocument);

// DELETE - Delete Document (Admin only)
router.delete("/:documentId", adminAuthMiddleware, DocumentController.deleteDocument);

module.exports = router;

