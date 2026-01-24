const express = require("express");
const router = express.Router();
const ExpenseController = require("./expense.controller.ts");
const { adminOrSupervisorAuthMiddleware } = require("../../middleware/adminOrSupervisorAuth.middleware.ts");

/**
 * @swagger
 * tags:
 *   - name: Expenses
 *     description: Expense management endpoints for tracking project expenses
 */

// Get total expense count (must come before /:expenseId route)
router.get("/total-count", ExpenseController.getTotalExpenseCount);

// Get expense summary for all projects (must come before /:expenseId route)
router.get("/summary/all-projects", ExpenseController.getExpenseSummaryAllProjects);

// Get expense summary by project (must come before /:expenseId route)
router.get("/summary/:projectId", ExpenseController.getExpenseSummaryByProject);

// Get expenses by project (must come before /:expenseId route)
router.get("/project/:projectId", ExpenseController.getExpensesByProject);

// Get total expense count by project (must come before /:expenseId route)
router.get("/project/:projectId/total-count", ExpenseController.getTotalExpenseCountByProject);

// Get total expense amount by project (must come before /:expenseId route)
router.get("/project/:projectId/total-amount", ExpenseController.getTotalExpenseAmountByProject);

// Get expenses by category (must come before /:expenseId route)
router.get("/category/:category", ExpenseController.getExpensesByCategory);

// Get all expenses
router.get("/", ExpenseController.getAllExpenses);

// Create a new expense (Admin and Supervisor only - Customers cannot create)
router.post("/", adminOrSupervisorAuthMiddleware, ExpenseController.createExpense);

// Get expense by ID
router.get("/:expenseId", ExpenseController.getExpenseById);

// Update expense (Admin and Supervisor only - Customers cannot update)
router.put("/:expenseId", adminOrSupervisorAuthMiddleware, ExpenseController.updateExpense);

// Delete expense (Admin and Supervisor only - Customers cannot delete)
router.delete("/:expenseId", adminOrSupervisorAuthMiddleware, ExpenseController.deleteExpense);

module.exports = router;

