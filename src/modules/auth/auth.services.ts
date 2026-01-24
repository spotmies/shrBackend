// Ensure dotenv is loaded before accessing environment variables
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });

const { generateAdminToken, generateUserToken } = require("../../utils/jwt");
const { AppDataSource } = require("../../data-source/typeorm.ts");
const { UserEntity } = require("../user/user.entity.ts");
const bcrypt = require("bcrypt");


exports.adminLogin = async (email: string, password: string) => {
    // Get admin credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin credentials are configured
    if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials are not configured in environment variables");
    }

    // Validate email
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    // Validate password
    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    // Check if credentials match
    if (email.trim() !== adminEmail.trim()) {
        throw new Error("Invalid email or password");
    }

    if (password !== adminPassword) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = generateAdminToken(email);

    return {
        success: true,
        message: "Login successful",
        token,
        email: email,
        role: "admin"
    };
};

/**
 * User login (for users and supervisors)
 * @param email - User email
 * @param password - User password
 * @returns Login result with token
 */
exports.userLogin = async (email: string, password: string) => {
    // Validate email
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    // Validate password
    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    // Get user from database
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
        where: { email: email.trim() }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check if user has password set
    if (!user.password) {
        throw new Error("Password not set for this user. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // Check if user is admin (admins should use admin login)
    if (user.role === "admin") {
        throw new Error("Admin users should use admin login endpoint");
    }

    // Check if user is supervisor (supervisors should use supervisor login)
    if (user.role === "supervisor") {
        throw new Error("Supervisor users should use supervisor login endpoint");
    }

    // Check if user has valid role (only "user" allowed)
    if (user.role !== "user") {
        throw new Error("Invalid user role. This endpoint is for regular users only.");
    }

    // Generate JWT token
    const token = generateUserToken(user.email, user.role);

    return {
        success: true,
        message: "Login successful",
        token,
        email: user.email,
        role: user.role,
        userId: user.userId
    };
};

/**
 * Supervisor login (for supervisors only)
 * @param email - Supervisor email
 * @param password - Supervisor password
 * @returns Login result with token
 */
exports.supervisorLogin = async (email: string, password: string) => {
    // Validate email
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    // Validate password
    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    // Get user from database
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
        where: { email: email.trim() }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check if user has password set
    if (!user.password) {
        throw new Error("Password not set for this supervisor. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // Check if user is supervisor
    if (user.role !== "supervisor") {
        throw new Error("Access denied. This endpoint is for supervisors only.");
    }

    // Generate JWT token
    const token = generateUserToken(user.email, user.role);

    return {
        success: true,
        message: "Supervisor login successful",
        token,
        email: user.email,
        role: user.role,
        userId: user.userId
    };
};

