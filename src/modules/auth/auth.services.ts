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
    // 1. Initial Validation & Trimming
    const trimmedEmail = email ? email.trim() : "";
    const trimmedPassword = password ? password.trim() : "";

    console.log(`[adminLogin DEBUG] Attempting login for email: "${trimmedEmail}"`);

    if (!trimmedEmail) throw new Error("Email is required");
    if (!trimmedPassword) throw new Error("Password is required");

    // 2. Database Lookup (Directly targeting Admin role)
    // We filter by role here to avoid getting a non-admin user with the same email
    let user = await prisma.user.findFirst({
        where: {
            email: { equals: trimmedEmail, mode: 'insensitive' },
            role: UserRole.admin
        },
        select: {
            userId: true,
            userName: true,
            email: true,
            password: true,
            role: true,
            contact: true,
            companyName: true
        }
    });

    // 3. Password Verification (If user found in DB)
    if (user) {
        console.log(`[adminLogin DEBUG] User found in DB. ID: ${user.userId}, Email: ${user.email}`);
        if (!user.password) {
            console.log(`[adminLogin DEBUG] User has no password set.`);
            throw new Error("Admin user exists but has no password set. Please contact support.");
        }

        const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
        console.log(`[adminLogin DEBUG] Password validation result: ${isPasswordValid}`);

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
    } else {
        console.log(`[adminLogin DEBUG] User NOT found in DB. Checking bootstrap...`);
        // 4. Fallback Bootstrap check (If user not in DB)
        const adminEmailFn = process.env.ADMIN_EMAIL;
        const adminPasswordFn = process.env.ADMIN_PASSWORD;

        if (!adminEmailFn || !adminPasswordFn) {
            console.log(`[adminLogin DEBUG] Admin env vars missing.`);
            throw new Error("Admin credentials are not configured in environment variables");
        }

        // Exact match against env vars
        const envEmailMatch = trimmedEmail.toLowerCase() === adminEmailFn.trim().toLowerCase();
        const envPassMatch = trimmedPassword === adminPasswordFn.trim();

        console.log(`[adminLogin DEBUG] Env Match - Email: ${envEmailMatch}, Password: ${envPassMatch}`);

        if (!envEmailMatch || !envPassMatch) {
            throw new Error("Invalid email or password");
        }

        // Bootstrap Admin User
        console.log(`[adminLogin DEBUG] Bootstrapping admin user...`);
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
        user = await prisma.user.create({
            data: {
                userName: "Admin",
                email: trimmedEmail.toLowerCase(),
                role: UserRole.admin,
                contact: "0000000000",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    }

    // 5. Success
    const token = generateAdminToken(user.email);
    console.log(`[adminLogin DEBUG] Login successful for: ${user.email}`);
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
    // 1. Initial Validation & Trimming
    const trimmedEmail = email ? email.trim() : "";
    const trimmedPassword = password ? password.trim() : "";

    if (!trimmedEmail) throw new Error("Email is required");
    if (!trimmedPassword) throw new Error("Password is required");

    // 2. Database Lookup
    const user = await prisma.user.findFirst({
        where: {
            email: { equals: trimmedEmail, mode: 'insensitive' },
            role: UserRole.user
        },
        select: {
            userId: true,
            userName: true,
            email: true,
            password: true,
            role: true
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 3. Password Verification
    if (!user.password) {
        throw new Error("Password not set for this account. Please contact administrator.");
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 4. Success
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
    // 1. Initial Validation & Trimming
    const trimmedEmail = email ? email.trim() : "";
    const trimmedPassword = password ? password.trim() : "";

    if (!trimmedEmail) throw new Error("Email is required");
    if (!trimmedPassword) throw new Error("Password is required");

    // 2. Database Lookup
    const user = await prisma.user.findFirst({
        where: {
            email: { equals: trimmedEmail, mode: 'insensitive' },
            role: UserRole.supervisor
        },
        select: {
            userId: true,
            userName: true,
            email: true,
            password: true,
            role: true
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 3. Password Verification
    if (!user.password) {
        throw new Error("Password not set for this supervisor. Please contact administrator.");
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 4. Success
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
