const express = require("express");
const router = express.Router();
const QuotationController = require("./quotations.controller");
const upload = require("../../config/multer.config").default;
const { userAuthMiddleware } = require("../../middleware/userAuth.middleware");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");

/**
 * @swagger
 * tags:
 *   - name: Quotations
 *     description: Quotation management endpoints
 */

// ============================================
// Public/Admin Routes (no user auth required)
// ============================================

// Create a new quotation (Admin only)
router.post("/", adminAuthMiddleware, upload.single("file"), QuotationController.createQuotation);

// Get total amount of a specific quotation (Public/Admin)
router.get("/:quotationId/total-amount", QuotationController.getQuotationTotalAmount);

// Download quotation file
router.get("/:quotationId/download", QuotationController.downloadQuotation);


// Get all quotations (Public or Admin)
router.get("/", QuotationController.getAllQuotations);

// ============================================
// User/Supervisor Routes (require user auth)
// ============================================

// Get pending quotations (must be before /:quotationId route)
router.get("/pending", userAuthMiddleware, QuotationController.getPendingQuotations);

// Get quotations by status (must be before /:quotationId route)
router.get("/status/:status", userAuthMiddleware, QuotationController.getQuotationsByStatus);

// Get quotations by project (must be before /:quotationId route)
router.get("/project/:projectId", userAuthMiddleware, QuotationController.getQuotationsByProject);

// Get quotations by user (must be before /:quotationId route)
router.get("/user/:userId", userAuthMiddleware, QuotationController.getQuotationsByUserId);

// Approve quotation (must be before /:quotationId route)
router.post("/:quotationId/approve", userAuthMiddleware, QuotationController.approveQuotation);

// Reject quotation (must be before /:quotationId route)
router.post("/:quotationId/reject", userAuthMiddleware, QuotationController.rejectQuotation);

// ============================================
// General Routes
// ============================================

// Get quotation by ID
router.get("/:quotationId", QuotationController.getQuotationById);

// Update quotation (Admin only)
router.put("/:quotationId", adminAuthMiddleware, upload.single("file"), QuotationController.updateQuotation);

// Resend quotation (Admin only)
router.post("/:quotationId/resend", adminAuthMiddleware, QuotationController.resendQuotation);

// Delete quotation (Admin only)
router.delete("/:quotationId", adminAuthMiddleware, QuotationController.deleteQuotation);

export default router;


