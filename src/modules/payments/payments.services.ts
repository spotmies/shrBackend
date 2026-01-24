const { AppDataSource } = require("../../data-source/typeorm.ts");
const PaymentsEntity = require("./payments.entity");
const { ProjectEntity } = require("../project/project.entity.ts");


const repository = AppDataSource.getRepository(PaymentsEntity);
const projectRepository = AppDataSource.getRepository(ProjectEntity);

exports.createPayment = async (data:
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

    const newPayment = repository.create({

        amount: data.amount,
        projectId: data.projectId,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        remarks: data.remarks || null,
        createdAt: new Date(),
        updatedAt: new Date(),
    })

    const savedPayment = await repository.save(newPayment);

    return savedPayment;

}

// Get payment by ID
exports.getPaymentByPaymentId = async (paymentId: string) => {

    if (!paymentId) {
        throw new Error("Payment not exists");
    }
    const payment = await repository.findOne({
        where: { paymentId },

    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    return payment;
};

// Get all payments
exports.getAllThePayments = async () => {
    const payments = await repository.find();

    if (!payments) {
        return [];
    }
    return payments;
};

// Update payment
exports.updatePayment = async (paymentId: string, updateData: {
    amount?: number,
    projectId?: string,
    paymentStatus?: string,
    paymentMethod?: string,
    paymentDate?: Date,
    remarks?: string | null,
    updatedAt?: Date
}) => {
    const payment = await repository.findOne({ where: { paymentId } });

    if (!payment) {
        throw new Error("Payment not found");
    }

    Object.assign(payment, updateData, { updatedAt: new Date() });

    const updatedPayment = await repository.save(payment);

    return updatedPayment;
};

// Delete payment
exports.deletePayment = async (paymentId: string) => {
    const payment = await repository.findOne({ where: { paymentId } });

    if (!payment) {
        throw new Error("Payment not found");
    }

    await repository.remove(payment);

    return { success: true, message: "Payment deleted successfully" };
};



/**
 * Get budget summary across all projects
 * Calculates: Total Budget, Payment Received, Payment Pending
 */
exports.getBudgetSummary = async () => {
    // Get all projects with their budgets
    const projects = await projectRepository.find();

    // Get all completed payments grouped by project
    const paymentsByProject = await repository
        .createQueryBuilder("payment")
        .select("payment.projectId", "projectId")
        .addSelect("COALESCE(SUM(payment.amount), 0)", "paymentReceived")
        .where("payment.paymentStatus = :status", { status: "completed" })
        .groupBy("payment.projectId")
        .getRawMany();

    // Create a map for quick lookup
    const paymentMap = new Map();
    paymentsByProject.forEach((item: any) => {
        paymentMap.set(item.projectId, parseFloat(item.paymentReceived));
    });

    // Calculate totals
    let totalBudget = 0;
    let totalPaymentReceived = 0;

    projects.forEach((project: any) => {
        const budget = parseFloat(project.totalBudget) || 0;
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
exports.getBudgetSummaryByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    // Get the project
    const project = await projectRepository.findOne({ where: { projectId } });

    if (!project) {
        throw new Error("Project not found");
    }

    const totalBudget = parseFloat(project.totalBudget) || 0;

    // Get completed payments for this project
    const completedPayments = await repository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "paidAmount")
        .where("payment.projectId = :projectId", { projectId })
        .andWhere("payment.paymentStatus = :status", { status: "completed" })
        .getRawOne();

    // Get pending payments for this project
    const pendingPayments = await repository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "pendingAmount")
        .where("payment.projectId = :projectId", { projectId })
        .andWhere("payment.paymentStatus = :status", { status: "pending" })
        .getRawOne();

    const paidAmount = parseFloat(completedPayments?.paidAmount || 0);
    const pendingAmount = parseFloat(pendingPayments?.pendingAmount || 0);

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


