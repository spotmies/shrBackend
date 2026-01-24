const express = require("express");
const router = express.Router();
const QuotationController = require("./quotations.controller.ts");
const upload = require("../../config/multer.config").default;
const { userAuthMiddleware } = require("../../middleware/userAuth.middleware.ts");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware.ts");

// ============================================
// Public/Admin Routes (no user auth required)
// ============================================

// Create a new quotation (Admin only)
router.post("/", adminAuthMiddleware, upload.single("file"), QuotationController.createQuotation);

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

// Approve quotation (must be before /:quotationId route)
router.post("/:quotationId/approve", userAuthMiddleware, QuotationController.approveQuotation);

// Reject quotation (must be before /:quotationId route)
router.post("/:quotationId/reject", userAuthMiddleware, QuotationController.rejectQuotation);

// ============================================
// General Routes
// ============================================

// Get quotation by ID
router.get("/:quotationId", QuotationController.getQuotationById);

// Update quotation (Admin only - should add adminAuthMiddleware if needed)
router.put("/:quotationId", upload.single("file"), QuotationController.updateQuotation);

// Delete quotation (Admin only - should add adminAuthMiddleware if needed)
router.delete("/:quotationId", QuotationController.deleteQuotation);

module.exports = router;

