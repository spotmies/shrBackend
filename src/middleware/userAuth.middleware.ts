import type { Request, Response, NextFunction } from "express";
// Ensure dotenv is loaded before accessing environment variables
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
const { verifyToken, extractTokenFromHeader } = require("../utils/jwt");
const { AppDataSource } = require("../data-source/typeorm.ts");
const { UserEntity } = require("../modules/user/user.entity.ts");

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

/**
 * User authentication middleware
 * Verifies JWT token and ensures user has "user" or "supervisor" role
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
exports.userAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

        // Check if user has user or supervisor role (not admin)
        if (decoded.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "This endpoint is for users and supervisors only. Admin should use admin endpoints."
            });
        }

        if (decoded.role !== "user" && decoded.role !== "supervisor") {
            return res.status(403).json({
                success: false,
                message: "Access denied. User or supervisor privileges required."
            });
        }

        // Get user from database to get userId
        const userRepository = AppDataSource.getRepository(UserEntity);
        const user = await userRepository.findOne({
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

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again."
        });
    }
};

