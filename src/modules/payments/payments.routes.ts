const express = require("express");
const router = express.Router();

const paymentController = require("./payments.controller");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");
const upload = require("../../config/multer.config").default;

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment management endpoints
 */

// Admin only routes
router.post("/createpayment", adminAuthMiddleware, upload.single("file"), paymentController.createPayment);
router.put("/updatepayment/:paymentId", adminAuthMiddleware, upload.single("file"), paymentController.updatePayment);
router.delete("/deletepayment/:paymentId", adminAuthMiddleware, paymentController.deletePayment);

// Public routes (can be accessed by anyone)
router.get("/getpayment/:paymentId", paymentController.getPaymentById);
router.get("/getallpayments", paymentController.getAllPayments);
router.get("/budget-summary", paymentController.getBudgetSummary);
router.get("/budget-summary/:projectId", paymentController.getBudgetSummaryByProject);

module.exports = router;



