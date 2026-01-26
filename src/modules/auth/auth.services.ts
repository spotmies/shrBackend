// Ensure dotenv is loaded before accessing environment variables
import { config } from "dotenv";
config({ path: "./src/config/.env" });

import prisma from "../../config/prisma.client";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

// Re-using the JWT utils might not be necessary if we want to inline for clarity, 
// but sticking to existing pattern of importing them is fine if available. 
// Assuming ../../utils/jwt exists. If not, I'll inline. 
// Based on previous file content, it was imported. 
// I'll keep the import but ensure it works with the rest of the flow.
import { generateAdminToken, generateUserToken } from "../../utils/jwt";


export const adminLogin = async (email: string, password: string) => {
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
export const userLogin = async (email: string, password: string) => {
    // Validate email
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    // Validate password
    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    // Get user from database
    const user = await prisma.user.findFirst({
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
    if (user.role === UserRole.admin) {
        throw new Error("Admin users should use admin login endpoint");
    }

    // Check if user is supervisor (supervisors should use supervisor login)
    if (user.role === UserRole.supervisor) {
        throw new Error("Supervisor users should use supervisor login endpoint");
    }

    // Check if user has valid role (only "user" allowed)
    if (user.role !== UserRole.user) {
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
export const supervisorLogin = async (email: string, password: string) => {
    // Validate email
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    // Validate password
    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    // Get user from database
    const user = await prisma.user.findFirst({
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
    if (user.role !== UserRole.supervisor) {
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
