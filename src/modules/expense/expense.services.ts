const { AppDataSource } = require("../../data-source/typeorm.ts");
const ExpenseEntity = require("./expense.entity.ts");
const { ProjectEntity } = require("../project/project.entity.ts");

const repository = AppDataSource.getRepository(ExpenseEntity);
const projectRepository = AppDataSource.getRepository(ProjectEntity);

// Create a new expense
exports.createExpense = async (data: {
    projectId: string;
    category: string;
    amount: number;
    date: Date;
    description?: string | null;
    status?: string;
}) => {
    // Validate category
    const validCategories = ["Labor", "Equipment", "Permits", "Materials"];
    if (!validCategories.includes(data.category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
    }

    // Validate status if provided
    if (data.status !== undefined) {
        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(data.status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
    }

    // Validate required fields
    if (!data.projectId) {
        throw new Error("Project ID is required");
    }

    if (!data.amount || data.amount <= 0) {
        throw new Error("Amount must be greater than 0");
    }

    if (!data.date) {
        throw new Error("Date is required");
    }

    const newExpense = repository.create({
        projectId: data.projectId,
        category: data.category,
        amount: data.amount,
        date: data.date,
        description: data.description || null,
        status: data.status || "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedExpense = await repository.save(newExpense);
    return savedExpense;
};

// Get expense by ID
exports.getExpenseById = async (expenseId: string) => {
    if (!expenseId) {
        throw new Error("Expense ID is required");
    }

    const expense = await repository.findOne({
        where: { expenseId },
        relations: ["project"]
    });

    if (!expense) {
        throw new Error("Expense not found");
    }

    return expense;
};

// Get all expenses
exports.getAllExpenses = async () => {
    const expenses = await repository.find({
        relations: ["project"],
        order: { createdAt: "DESC" }
    });

    if (!expenses) {
        return [];
    }
    return expenses;
};

// Get expenses by project ID
exports.getExpensesByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const expenses = await repository.find({
        where: { projectId },
        relations: ["project"],
        order: { createdAt: "DESC" }
    });

    return expenses;
};

// Get expenses by category
exports.getExpensesByCategory = async (category: string) => {
    const validCategories = ["Labor", "Equipment", "Permits", "Materials"];
    if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
    }

    const expenses = await repository.find({
        where: { category },
        relations: ["project"],
        order: { createdAt: "DESC" }
    });

    if (!expenses) {
        return [];
    }

    return expenses;
};

// Get total expense count
exports.getTotalExpenseCount = async () => {
    const totalCount = await repository.count();
    return {
        totalCount: totalCount
    };
};

// Get total expense count by project
exports.getTotalExpenseCountByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const count = await repository.count({
        where: { projectId }
    });

    return {
        projectId: projectId,
        totalCount: count
    };
};

// Get total expense amount by project
exports.getTotalExpenseAmountByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const expenses = await repository.find({
        where: { projectId }
    });

    const totalAmount = expenses.reduce((sum: number, expense: any) => {
        return sum + Number(expense.amount);
    }, 0);

    return {
        projectId: projectId,
        totalAmount: totalAmount,
        count: expenses.length
    };
};

// Update expense
exports.updateExpense = async (expenseId: string, updateData: {
    category?: string;
    amount?: number;
    date?: Date;
    description?: string | null;
    projectId?: string;
    status?: string;
}) => {
    const expense = await repository.findOne({
        where: { expenseId }
    });

    if (!expense) {
        throw new Error("Expense not found");
    }

    // Validate category if provided
    if (updateData.category !== undefined) {
        const validCategories = ["Labor", "Equipment", "Permits", "Materials"];
        if (!validCategories.includes(updateData.category)) {
            throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
        }
        expense.category = updateData.category;
    }

    // Validate status if provided
    if (updateData.status !== undefined) {
        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(updateData.status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
        expense.status = updateData.status;
    }

    if (updateData.amount !== undefined) {
        if (updateData.amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }
        expense.amount = updateData.amount;
    }

    if (updateData.date !== undefined) {
        expense.date = updateData.date;
    }

    if (updateData.description !== undefined) {
        expense.description = updateData.description;
    }

    if (updateData.projectId !== undefined) {
        expense.projectId = updateData.projectId;
    }

    expense.updatedAt = new Date();

    const updatedExpense = await repository.save(expense);
    return updatedExpense;
};

// Delete expense
exports.deleteExpense = async (expenseId: string) => {
    const expense = await repository.findOne({
        where: { expenseId }
    });

    if (!expense) {
        throw new Error("Expense not found");
    }

    await repository.remove(expense);
    return { success: true, message: "Expense deleted successfully" };
};

/**
 * Get expense summary for all projects
 * Returns: projectId, projectName, total expense, and expenses per month for each project
 */
exports.getExpenseSummaryAllProjects = async () => {
    // Get all projects
    const projects = await projectRepository.find();

    if (!projects || projects.length === 0) {
        return [];
    }

    // Get all expenses
    const allExpenses = await repository.find({
        order: { date: "ASC" }
    });

    // Create maps to store expenses by project
    const projectExpenseMap = new Map<string, any[]>();

    // Group expenses by project
    allExpenses.forEach((expense: any) => {
        const projectId = expense.projectId;
        if (!projectExpenseMap.has(projectId)) {
            projectExpenseMap.set(projectId, []);
        }
        projectExpenseMap.get(projectId)!.push(expense);
    });

    // Build summary data for each project

    const summaryData = projects.map((project: any) => {
        const projectId = project.projectId;
        const projectExpenses = projectExpenseMap.get(projectId) || [];

        // Calculate total expense
        const totalExpense = projectExpenses.reduce((sum: number, expense: any) => {
            return sum + parseFloat(expense.amount);
        }, 0);

        // Group expenses by month
        const monthlyExpenseMap: { [key: string]: number } = {};
        projectExpenses.forEach((expense: any) => {
            const expenseDate = new Date(expense.date);
            const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyExpenseMap[monthKey]) {
                monthlyExpenseMap[monthKey] = 0;
            }
            monthlyExpenseMap[monthKey] += parseFloat(expense.amount);
        });

        // Convert monthly expenses to array format
        const expensesPerMonth = Object.keys(monthlyExpenseMap)
            .sort()
            .map(month => ({
                month: month,
                totalExpense: Math.round((monthlyExpenseMap[month] || 0) * 100) / 100
            }));

        return {
            projectId: projectId,
            projectName: project.projectName || "",
            totalExpense: Math.round(totalExpense * 100) / 100,
            expensesPerMonth: expensesPerMonth
        };
    });

    return summaryData;
};

/**
 * Get expense summary for a specific project
 * Returns: project details, total expenses, and expenses per month
 * @param projectId - Project ID to get expense summary for
 */
exports.getExpenseSummaryByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    // Get the project
    const project = await projectRepository.findOne({ where: { projectId } });

    if (!project) {
        throw new Error("Project not found");
    }

    // Get all expenses for this project
    const expenses = await repository.find({
        where: { projectId },
        order: { date: "ASC" }
    });

    // Calculate total expense
    const totalExpense = expenses.reduce((sum: number, expense: any) => {
        return sum + parseFloat(expense.amount);
    }, 0);

    // Group expenses by month
    const expensesPerMonth: { [key: string]: number } = {};

    expenses.forEach((expense: any) => {
        const expenseDate = new Date(expense.date);
        const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

        if (!expensesPerMonth[monthKey]) {
            expensesPerMonth[monthKey] = 0;
        }
        expensesPerMonth[monthKey] += parseFloat(expense.amount);
    });

    // Convert to array format
    const monthlyExpenses = Object.keys(expensesPerMonth)
        .sort()
        .map(month => ({
            month: month,
            totalExpense: Math.round((expensesPerMonth[month] || 0) * 100) / 100
        }));

    return {
        projectId: project.projectId,
        projectName: project.projectName || "",
        projectType: project.projectType || "",
        location: project.location || "",
        totalBudget: parseFloat(project.totalBudget) || 0,
        startDate: project.startDate,
        expectedCompletion: project.expectedCompletion,
        totalExpense: Math.round(totalExpense * 100) / 100,
        expensesPerMonth: monthlyExpenses
    };
};

