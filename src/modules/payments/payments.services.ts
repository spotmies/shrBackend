import prisma from "../../config/prisma.client";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

export const createPayment = async (data:
    {
        amount: number,
        projectId: string,
        paymentStatus: string,
        paymentMethod: string,
        paymentDate: Date,
        remarks?: string | null,
        createdAt: Date,
        updatedAt: Date
    }) => {

    const newPayment = await prisma.payment.create({
        data: {
            amount: data.amount,
            projectId: data.projectId,
            paymentStatus: data.paymentStatus as PaymentStatus,
            paymentMethod: data.paymentMethod as PaymentMethod,
            paymentDate: data.paymentDate,
            remarks: data.remarks || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    return newPayment;
}

// Get payment by ID
export const getPaymentByPaymentId = async (paymentId: string) => {

    if (!paymentId) {
        throw new Error("Payment not exists");
    }
    const payment = await prisma.payment.findUnique({
        where: { paymentId },
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    return payment;
};

// Get all payments
export const getAllThePayments = async () => {
    const payments = await prisma.payment.findMany();

    if (!payments) {
        return [];
    }
    return payments;
};

// Update payment
export const updatePayment = async (paymentId: string, updateData: {
    amount?: number,
    projectId?: string,
    paymentStatus?: string,
    paymentMethod?: string,
    paymentDate?: Date,
    remarks?: string | null,
    updatedAt?: Date
}) => {
    const payment = await prisma.payment.findUnique({ where: { paymentId } });

    if (!payment) {
        throw new Error("Payment not found");
    }

    const dataToUpdate: Prisma.PaymentUpdateInput = {
        updatedAt: new Date(),
    };

    if (updateData.amount !== undefined) dataToUpdate.amount = updateData.amount;
    if (updateData.projectId !== undefined) dataToUpdate.project = { connect: { projectId: updateData.projectId } };
    if (updateData.paymentStatus !== undefined) dataToUpdate.paymentStatus = updateData.paymentStatus as PaymentStatus;
    if (updateData.paymentMethod !== undefined) dataToUpdate.paymentMethod = updateData.paymentMethod as PaymentMethod;
    if (updateData.paymentDate !== undefined) dataToUpdate.paymentDate = updateData.paymentDate;
    if (updateData.remarks !== undefined) dataToUpdate.remarks = updateData.remarks;

    const updatedPayment = await prisma.payment.update({
        where: { paymentId },
        data: dataToUpdate,
    });

    return updatedPayment;
};

// Delete payment
export const deletePayment = async (paymentId: string) => {
    const payment = await prisma.payment.findUnique({ where: { paymentId } });

    if (!payment) {
        throw new Error("Payment not found");
    }

    await prisma.payment.delete({ where: { paymentId } });

    return { success: true, message: "Payment deleted successfully" };
};



/**
 * Get budget summary across all projects
 * Calculates: Total Budget, Payment Received, Payment Pending
 */
export const getBudgetSummary = async () => {
    // Get all projects with their budgets
    const projects = await prisma.project.findMany();

    // Get all completed payments grouped by project
    const paymentsByProject = await prisma.payment.groupBy({
        by: ['projectId'],
        _sum: {
            amount: true
        },
        where: {
            paymentStatus: PaymentStatus.completed,
            projectId: { not: null } // Ensure projectId is not null
        }
    });

    // Create a map for quick lookup
    const paymentMap = new Map();
    paymentsByProject.forEach((item: any) => {
        if (item.projectId) {
            paymentMap.set(item.projectId, parseFloat(item._sum.amount?.toString() || "0"));
        }
    });

    // Calculate totals
    let totalBudget = 0;
    let totalPaymentReceived = 0;

    projects.forEach((project: any) => {
        const budget = parseFloat(project.totalBudget.toString()) || 0;
        const received = paymentMap.get(project.projectId) || 0;
        totalBudget += budget;
        totalPaymentReceived += received;
    });

    const totalPaymentPending = totalBudget - totalPaymentReceived;

    // Calculate payment progress percentage
    const progressPercentage = totalBudget > 0
        ? Math.round((totalPaymentReceived / totalBudget) * 100)
        : 0;

    return {
        totalBudget: Math.round(totalBudget * 100) / 100,
        paymentReceived: Math.round(totalPaymentReceived * 100) / 100,
        paymentPending: Math.round(totalPaymentPending * 100) / 100,
        progressPercentage: progressPercentage
    };
};



/**
 * Get budget summary for a specific project
 * Calculates: Total Budget, Paid Amount, Pending Amount, Progress Percentage
 * @param projectId - Project ID to get budget summary for
 */
export const getBudgetSummaryByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    // Get the project
    const project = await prisma.project.findUnique({ where: { projectId } });

    if (!project) {
        throw new Error("Project not found");
    }

    const totalBudget = parseFloat(project.totalBudget.toString()) || 0;

    // Get completed payments for this project
    const completedPayments = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            projectId: projectId,
            paymentStatus: PaymentStatus.completed
        }
    });

    // Get pending payments for this project
    const pendingPayments = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            projectId: projectId,
            paymentStatus: PaymentStatus.pending
        }
    });

    const paidAmount = parseFloat(completedPayments._sum.amount?.toString() || "0");
    const pendingAmount = parseFloat(pendingPayments._sum.amount?.toString() || "0");

    // Calculate payment progress percentage
    const progressPercentage = totalBudget > 0
        ? Math.round((paidAmount / totalBudget) * 100)
        : 0;

    return {
        projectId: project.projectId,
        projectName: project.projectName || "",
        totalBudget: Math.round(totalBudget * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        pendingAmount: Math.round(pendingAmount * 100) / 100,
        progressPercentage: progressPercentage
    };
};
