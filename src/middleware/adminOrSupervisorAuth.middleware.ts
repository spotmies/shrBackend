import type { Request, Response, NextFunction } from "express";
// Ensure dotenv is loaded before accessing environment variables
import { config } from "dotenv";
config({ path: "./src/config/.env" });
import prisma from "../config/prisma.client";
const { verifyToken, extractTokenFromHeader } = require("../utils/jwt");

interface AuthRequest extends Request {
    user?: {
        userId?: string;
        email: string;
        role: string;
    };
}

/**
 * Admin or Supervisor authentication middleware
 * Verifies JWT token and ensures user has admin or supervisor role (blocks customers/users)
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
exports.adminOrSupervisorAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required. Please provide a valid Bearer token."
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please login again."
            });
        }

        // Check if user has admin or supervisor role (block customers/users)
        if (decoded.role !== "admin" && decoded.role !== "supervisor") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin or supervisor privileges required. Customers cannot perform this action."
            });
        }

        // For admin, attach user info directly
        if (decoded.role === "admin") {
            req.user = {
                email: decoded.email,
                role: decoded.role
            };
            return next();
        }

        // For supervisor, get user from database to get userId
        if (decoded.role === "supervisor") {
            const user = await prisma.user.findFirst({
                where: { email: decoded.email }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found. Please login again."
                });
            }

            // Attach user info to request object
            req.user = {
                userId: user.userId,
                email: decoded.email,
                role: decoded.role
            };
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again."
        });
    }
};
