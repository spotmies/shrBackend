const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints for Admin, User, and Supervisor
 */


router.post("/admin/login", authController.adminLogin);


router.post("/user/login", authController.userLogin);


router.post("/supervisor/login", authController.supervisorLogin);

module.exports = router;
