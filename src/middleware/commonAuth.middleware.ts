import type { Request, Response, NextFunction } from "express";
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
 * Common authentication middleware
 * Verifies JWT token and allows any authenticated user (Admin, Supervisor, User)
 */
export const commonAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required."
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        if (decoded.role === "admin") {
            req.user = {
                email: decoded.email,
                role: decoded.role
                // Admin might not have a userId in User table, or we accept email as identifier for admin
            };
        } else if (decoded.role === "supervisor") {
            const supervisor = await prisma.supervisor.findFirst({
                where: { email: decoded.email }
            });

            if (supervisor) {
                req.user = {
                    userId: supervisor.supervisorId,
                    email: decoded.email,
                    role: decoded.role
                };
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Supervisor not found."
                });
            }
        } else {
            // For user, fetch ID
            const user = await prisma.user.findFirst({
                where: { email: decoded.email }
            });

            if (user) {
                req.user = {
                    userId: user.userId,
                    email: decoded.email,
                    role: decoded.role
                };
            } else {
                return res.status(401).json({
                    success: false,
                    message: "User not found."
                });
            }
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed."
        });
    }
};
