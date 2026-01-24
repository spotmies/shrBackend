const express = require("express");
const router = express.Router();

const paymentController = require("./payments.controller.ts");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware.ts");

// Admin only routes
router.post("/createpayment", adminAuthMiddleware, paymentController.createPayment);
router.put("/updatepayment/:paymentId", adminAuthMiddleware, paymentController.updatePayment);
router.delete("/deletepayment/:paymentId", adminAuthMiddleware, paymentController.deletePayment);

// Public routes (can be accessed by anyone)
router.get("/getpayment/:paymentId", paymentController.getPaymentById);
router.get("/getallpayments", paymentController.getAllPayments);
router.get("/budget-summary", paymentController.getBudgetSummary);
router.get("/budget-summary/:projectId", paymentController.getBudgetSummaryByProject);

module.exports = router;


