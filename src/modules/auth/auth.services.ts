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
    // Validate email
    if (!email || email.trim() === "") {
        throw new Error("Email is required");
    }

    // Validate password
    if (!password || password.trim() === "") {
        throw new Error("Password is required");
    }

    // Step 1: Check Database for Admin User
    let user = await prisma.user.findFirst({
        where: { email: email.trim() }
    });

    // Check if the found user is actually an admin
    if (user && user.role !== UserRole.admin) {
        throw new Error("Access denied. Not an admin account.");
    }

    if (user) {
        // Step 2: User Exists in DB - Validate with DB Password
        if (!user.password) {
            throw new Error("Admin user exists but has no password set. Please reset via database or contact support.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
    } else {
        // Step 3: User Does NOT Exist in DB - Fallback to Env Credentials (Bootstrap)

        // Get admin credentials from .env
        const adminEmailFn = process.env.ADMIN_EMAIL;
        const adminPasswordFn = process.env.ADMIN_PASSWORD;

        if (!adminEmailFn || !adminPasswordFn) {
            throw new Error("Admin credentials are not configured in environment variables");
        }

        // Exact match check
        if (email.trim() !== adminEmailFn || password !== adminPasswordFn) {
            // Note: We return generic error to avoid enumeration, but locally we know it's the Env check failing.
            throw new Error("Invalid email or password");
        }

        // Valid Env Credentials! -> Bootstrap the Admin User in DB
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                userName: "Admin",
                email: email.trim(),
                role: UserRole.admin,
                contact: "0000000000",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    }

    // Generate JWT token
    const token = generateAdminToken(user.email);

    return {
        success: true,
        message: "Login successful",
        token,
        email: user.email,
        role: "admin",
        userId: user.userId
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
