const express = require("express");
const router = express.Router();
const UserController = require("./user.controller");
const { adminAuthMiddleware } = require("../../middleware/adminAuth.middleware");
const { customerAuthMiddleware } = require("../../middleware/customerAuth.middleware");
const { userAuthMiddleware } = require("../../middleware/userAuth.middleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile endpoints
 */


router.get("/", UserController.getAllUsers);
router.get("/leads/stats", adminAuthMiddleware, UserController.getCustomerLeadsStats);
router.get("/leads/new", adminAuthMiddleware, UserController.getNewLeads);
router.get("/leads/closed", adminAuthMiddleware, UserController.getClosedCustomers);




router.post("/", adminAuthMiddleware, UserController.createUser);

// Admin Account Settings (email, company, contact)
router.get("/admin/account-settings", adminAuthMiddleware, UserController.getAdminAccountSettings);

router.put("/admin/account-settings", adminAuthMiddleware, UserController.updateAdminAccountSettings);

// Admin General Settings (timezone, currency, language)
router.get("/admin/general-settings", adminAuthMiddleware, UserController.getAdminGeneralSettings);

router.put("/admin/general-settings", adminAuthMiddleware, UserController.updateAdminGeneralSettings);

// Admin Password
router.post("/admin/change-password", adminAuthMiddleware, UserController.changeAdminPassword);


router.put("/profile", userAuthMiddleware, UserController.updateUserProfile);


router.post("/profile/change-password", userAuthMiddleware, UserController.changeUserPassword);


router.get("/:userId", UserController.getuserById);


router.put("/:userId", adminAuthMiddleware, UserController.updateUser);


router.delete("/:userId", adminAuthMiddleware, UserController.deleteUser);


router.post("/:userId/approve-supervisor", customerAuthMiddleware, UserController.approveSupervisor);


router.post("/:userId/reject-supervisor", customerAuthMiddleware, UserController.rejectSupervisor);

export default router;

