const AppDataSource = require("../../data-source/typeorm.ts");
const PaymentsEntity = require("./payments.entity");
const ProjectEntity = require("../project/project.entity.ts");


const repository = AppDataSource.getRepository(PaymentsEntity);
const projectRepository = AppDataSource.getRepository(ProjectEntity);

exports.createPayment = async(data:
    {
         amount: number, 
         projectId: string,
         paymentStatus: string,
         paymentMethod: string,
         paymentDate: Date,
         remarks?: string | null,
         createdAt: Date,
         updatedAt: Date
    })=>{

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

   if(!paymentId){
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
    
    if(!payments){
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

    return {
        totalBudget: Math.round(totalBudget * 100) / 100,
        paymentReceived: Math.round(totalPaymentReceived * 100) / 100,
        paymentPending: Math.round(totalPaymentPending * 100) / 100
    };
};

