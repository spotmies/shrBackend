import type { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
config({ path: "./src/config/.env" });
import prisma from "../config/prisma.client";
const { verifyToken, extractTokenFromHeader } = require("../utils/jwt");

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

/**
 * Customer and Supervisor authentication middleware
 * Verifies JWT token and ensures user has "user" (customer) or "supervisor" role.
 * Admins are NOT allowed.
 */
export const customerSupervisorAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
            return res.status(403).json({
                success: false,
                message: "Admins are not allowed to access messages."
            });
        }

        if (decoded.role === "supervisor") {
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
        } else if (decoded.role === "user") {
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
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied. Role not authorized."
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed."
        });
    }
};
