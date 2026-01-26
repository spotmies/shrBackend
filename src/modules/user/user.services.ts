import prisma from "../../config/prisma.client";
import * as bcrypt from "bcrypt";
import { UserRole, SupervisorStatus, Prisma } from "@prisma/client";

// Create a new user
export const createUser = async (data: {
    userName: string;
    role: string;
    email: string;
    password?: string | null;
    contact: string;
    estimatedInvestment?: number | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}) => {
    const existingUser = await prisma.user.findFirst({
        where: { email: data.email } // or data.userName, adjust as needed
    });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash password if provided
    let hashedPassword = null;
    if (data.password && data.password.trim() !== "") {
        hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const newUser = await prisma.user.create({
        data: {
            userName: data.userName,
            role: data.role as UserRole,
            email: data.email,
            password: hashedPassword,
            contact: data.contact,
            estimatedInvestment: data.estimatedInvestment || null,
            notes: data.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

export const getUserById = async (userId: string) => {

    if (!userId) {
        throw new Error("User not exists");
    }

    const user = await prisma.user.findUnique({
        where: { userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    if (!users) {
        return []
    }
    return users
}

export const updateUser = async (userId: string, updatedUserData: {
    userName?: string;
    role?: string;
    email?: string;
    password?: string | null;
    contact?: string;
    estimatedInvestment?: number | null;
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}) => {
    const user = await prisma.user.findUnique({ where: { userId } })

    if (!user) {
        throw new Error("User not found")
    }

    const dataToUpdate: Prisma.UserUpdateInput = {
        updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (updatedUserData.userName !== undefined) dataToUpdate.userName = updatedUserData.userName;
    if (updatedUserData.role !== undefined) dataToUpdate.role = updatedUserData.role as UserRole;
    if (updatedUserData.email !== undefined) dataToUpdate.email = updatedUserData.email;
    if (updatedUserData.contact !== undefined) dataToUpdate.contact = updatedUserData.contact;
    if (updatedUserData.estimatedInvestment !== undefined) dataToUpdate.estimatedInvestment = updatedUserData.estimatedInvestment;
    if (updatedUserData.notes !== undefined) dataToUpdate.notes = updatedUserData.notes;

    // Handle password update (hash if provided)
    if (updatedUserData.password !== undefined) {
        if (updatedUserData.password === null || updatedUserData.password.trim() === "") {
            dataToUpdate.password = null;
        } else {
            dataToUpdate.password = await bcrypt.hash(updatedUserData.password, 10);
        }
    }

    const updatedUser = await prisma.user.update({
        where: { userId },
        data: dataToUpdate,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
}

export const deleteUser = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { userId } })

    if (!user) {
        throw new Error("User not found")
    }

    const deletedUser = await prisma.user.delete({ where: { userId } });
    return deletedUser;
}

/**
 * Approve supervisor for a user
 * Updates the supervisor's approve field to "approve"
 * @param userId - The user ID
 */
export const approveSupervisor = async (userId: string) => {
    // Find the user
    const user = await prisma.user.findUnique({
        where: { userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Check if user has a supervisor assigned
    if (!user.supervisorId) {
        throw new Error("User does not have a supervisor assigned");
    }

    // Find the supervisor user (the user with role "supervisor" that is assigned to this user)
    const supervisorUser = await prisma.user.findUnique({
        where: { userId: user.supervisorId }
    });

    if (!supervisorUser) {
        throw new Error("Supervisor user not found");
    }

    // Find the supervisor record by email (since supervisor and user share the same email)
    const supervisor = await prisma.supervisor.findUnique({
        where: { email: supervisorUser.email }
    });

    if (!supervisor) {
        throw new Error("Supervisor record not found");
    }

    // Update supervisor's approve field
    const updatedSupervisor = await prisma.supervisor.update({
        where: { supervisorId: supervisor.supervisorId },
        data: {
            approve: "approve",
            updatedAt: new Date(),
        }
    });

    // Remove password from response
    const { password: _, ...supervisorWithoutPassword } = updatedSupervisor;
    return supervisorWithoutPassword;
};

/**
 * Reject supervisor for a user
 * Updates the supervisor's status field to "reject"
 * @param userId - The user ID
 */
export const rejectSupervisor = async (userId: string) => {
    // Find the user
    const user = await prisma.user.findUnique({
        where: { userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Check if user has a supervisor assigned
    if (!user.supervisorId) {
        throw new Error("User does not have a supervisor assigned");
    }

    // Find the supervisor user (the user with role "supervisor" that is assigned to this user)
    const supervisorUser = await prisma.user.findUnique({
        where: { userId: user.supervisorId }
    });

    if (!supervisorUser) {
        throw new Error("Supervisor user not found");
    }

    // Find the supervisor record by email (since supervisor and user share the same email)
    const supervisor = await prisma.supervisor.findUnique({
        where: { email: supervisorUser.email }
    });

    if (!supervisor) {
        throw new Error("Supervisor record not found");
    }

    // Update supervisor's status field to "reject"
    const updatedSupervisor = await prisma.supervisor.update({
        where: { supervisorId: supervisor.supervisorId },
        data: {
            status: SupervisorStatus.reject,
            updatedAt: new Date(),
        }
    });

    // Remove password from response
    const { password: _, ...supervisorWithoutPassword } = updatedSupervisor;
    return supervisorWithoutPassword;
};
