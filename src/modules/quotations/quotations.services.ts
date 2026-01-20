
const AppDataSource = require("../../data-source/typeorm.ts");
const QuotationEntity = require("./quotations.entity");

const repository = AppDataSource.getRepository(QuotationEntity);

exports.createQuotation = async(data:
    {
         totalAmount: number, 
         status: string,
         lineItems?: Array<{ description: string; amount: number }> | null,
         date?: Date | null,
         projectId: string,
         createdAt: Date,
         updatedAt: Date
    }, 
    file: {
        buffer:Buffer
        originalname:string
        mimetype:string
    }
)=>{
    // Validate lineItems
    const lineItems = data.lineItems || [];
    
    // Calculate totalAmount from lineItems if not provided or if lineItems exist
    let calculatedTotalAmount = data.totalAmount;
    if (lineItems.length > 0) {
        calculatedTotalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    }
    
    // If totalAmount was provided but doesn't match calculated, use provided (for backward compatibility)
    // Otherwise use calculated
    const finalTotalAmount = data.totalAmount || calculatedTotalAmount;

const newQuotation = repository.create({
 
        totalAmount: finalTotalAmount,
        status: data.status,
        lineItems: lineItems.length > 0 ? lineItems : [],
        date: data.date || null,
        projectId: data.projectId,

        fileData: file.buffer || null,
        fileName: file.originalname || null,
        fileType: file.mimetype || null,
        
        createdAt: new Date(),
        updatedAt: new Date(),
   })
  
   const savedQuotation = await repository.save(newQuotation);

   return savedQuotation;

}

// Helper function to format quotation ID (QU0001 format)
const formatQuotationId = (quotationId: string, index?: number): string => {
    // If index is provided, use it for sequential numbering
    if (index !== undefined) {
        return `QU${String(index + 1).padStart(4, '0')}`;
    }
    // Otherwise, extract number from UUID or use a hash
    // For now, we'll use a simple approach - extract first 4 chars and convert
    const hash = quotationId.split('-')[0];
    const num = parseInt(hash.substring(0, 4), 16) % 10000;
    return `QU${String(num).padStart(4, '0')}`;
};

// Helper function to format quotation response
const formatQuotationResponse = (quotation: any, index?: number) => {
    const formattedId = formatQuotationId(quotation.quotationId, index);
    
    return {
        id: formattedId,
        quotationId: quotation.quotationId,
        projectName: quotation.projectId?.projectName || null,
        customerName: quotation.projectId?.user?.userName || null,
        customerEmail: quotation.projectId?.user?.email || null,
        status: quotation.status,
        date: quotation.date ? new Date(quotation.date).toISOString().split('T')[0] : null,
        lineItems: quotation.lineItems || [],
        totalAmount: parseFloat(String(quotation.totalAmount || 0)),
        fileName: quotation.fileName || null,
        fileType: quotation.fileType || null,
        createdAt: quotation.createdAt,
        updatedAt: quotation.updatedAt
    };
};

// // Get quotation by ID
exports.getQuotationByQuotationId = async (quotationId: string) => {

   if(!quotationId){
      throw new Error("Quotation not exists");
   }
    const quotation = await repository.findOne({ 
        where: { quotationId },
        relations: ["projectId", "projectId.user"]
    });    
    if (!quotation) {
        throw new Error("Quotation not found");
    } 
   return formatQuotationResponse(quotation);
};

// // Get all quotations
exports.getAllTheQuotations = async () => {
    const quotations = await repository.find({
        relations: ["projectId", "projectId.user"],
        order: { createdAt: "DESC" }
    });
    
    if(!quotations){
        return [];
    }
    
    // Format each quotation response
    return quotations.map((quotation, index) => formatQuotationResponse(quotation, index));
};

// // Update quotation
exports.updateQuotation = async (quotationId: string, updateData: {
    totalAmount?: number,
    status?: string,
    lineItems?: Array<{ description: string; amount: number }> | null,
    date?: Date | null,
    projectId?: string,
    updatedAt?: Date
}, file?: {
    buffer: Buffer
    originalname: string
    mimetype: string
}) => {
    const quotation = await repository.findOne({ where: { quotationId } });
    
    if (!quotation) {
        throw new Error("Quotation not found");
    }
  
    // Update only the fields that are provided in updateData
    if (updateData.totalAmount !== undefined) {
        quotation.totalAmount = updateData.totalAmount;
    }
    
    if (updateData.status !== undefined) {
        quotation.status = updateData.status;
    }
    
    if (updateData.lineItems !== undefined) {
        quotation.lineItems = updateData.lineItems || [];
        
        // Recalculate totalAmount from lineItems if lineItems are updated
        if (updateData.lineItems && updateData.lineItems.length > 0) {
            const calculatedTotal = updateData.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
            quotation.totalAmount = calculatedTotal;
        }
    }
    
    if (updateData.date !== undefined) {
        quotation.date = updateData.date;
    }
    
    if (updateData.projectId !== undefined) {
        quotation.projectId = updateData.projectId;
    }
    
    // Always update the updatedAt timestamp
    quotation.updatedAt = new Date();

    // Update file fields only if file is provided
    if (file) {
        quotation.fileData = file.buffer;
        quotation.fileName = file.originalname;
        quotation.fileType = file.mimetype;
    }

    const updatedQuotation = await repository.save(quotation);
    
    return updatedQuotation;
};

// // Delete quotation
exports.deleteQuotation = async (quotationId: string) => {
    const quotation = await repository.findOne({ where: { quotationId } });
    
    if (!quotation) {
        throw new Error("Quotation not found");
    }
    
    await repository.remove(quotation);

    return { success: true, message: "Quotation deleted successfully" };
};

/**
 * Get quotations by status
 * @param status - The status to filter by (pending, approved, rejected, locked)
 */
exports.getQuotationsByStatus = async (status: string) => {
    const validStatuses = ['pending', 'approved', 'rejected', 'locked'];
    
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const quotations = await repository.find({
        where: { status },
        relations: ["projectId", "projectId.user"],
        order: { createdAt: "DESC" }
    });
    
    return quotations.map((quotation, index) => formatQuotationResponse(quotation, index));
};

/**
 * Get pending quotations (for users to review)
 */
exports.getPendingQuotations = async () => {
    const quotations = await repository.find({
        where: { status: "pending" },
        relations: ["projectId", "projectId.user"],
        order: { createdAt: "DESC" }
    });
    return quotations.map((quotation, index) => formatQuotationResponse(quotation, index));
};

/**
 * Get quotations by project ID
 * @param projectId - The project ID to filter by
 */
exports.getQuotationsByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const quotations = await repository.find({
        where: { projectId },
        relations: ["projectId", "projectId.user"],
        order: { createdAt: "DESC" }
    });
    
    return quotations.map((quotation, index) => formatQuotationResponse(quotation, index));
};

/**
 * Approve a quotation (User only)
 * Changes status to "approved"
 * @param quotationId - The quotation ID to approve
 * @param userId - The user ID who is approving
 */
exports.approveQuotation = async (quotationId: string, userId: string) => {
    // Find the quotation
    const quotation = await repository.findOne({
        where: { quotationId },
        relations: ["projectId"]
    });

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    // Check if quotation is already approved
    if (quotation.status === "approved") {
        throw new Error("Quotation is already approved");
    }

    // Check if quotation is already rejected
    if (quotation.status === "rejected") {
        throw new Error("Cannot approve a rejected quotation");
    }

    // Check if quotation is already locked
    if (quotation.status === "locked") {
        throw new Error("Quotation is already locked");
    }

    // Only pending quotations can be approved
    if (quotation.status !== "pending") {
        throw new Error("Only pending quotations can be approved");
    }

    // Approve the quotation
    quotation.status = "approved";
    quotation.updatedAt = new Date();

    await repository.save(quotation);
    
    // Return with relations and format response
    const updatedQuotation = await repository.findOne({
        where: { quotationId },
        relations: ["projectId", "projectId.user"]
    });
    
    if (!updatedQuotation) {
        throw new Error("Quotation not found after update");
    }
    
    return formatQuotationResponse(updatedQuotation);
};

/**
 * Reject a quotation (User only)
 * Changes status to "rejected"
 * Admin can resubmit rejected quotations by changing status back to "pending"
 * @param quotationId - The quotation ID to reject
 * @param userId - The user ID who is rejecting
 */
exports.rejectQuotation = async (quotationId: string, userId: string) => {
    const quotation = await repository.findOne({
        where: { quotationId },
        relations: ["projectId"]
    });

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    // Check if quotation is already approved
    if (quotation.status === "approved") {
        throw new Error("Cannot reject an approved quotation");
    }

    // Check if quotation is already rejected
    if (quotation.status === "rejected") {
        throw new Error("Quotation is already rejected");
    }

    // Only pending quotations can be rejected
    if (quotation.status !== "pending") {
        throw new Error("Only pending quotations can be rejected");
    }

    // Reject the quotation
    // This allows admin to resubmit the quotation later
    quotation.status = "rejected";
    quotation.updatedAt = new Date();

    await repository.save(quotation);
    
    // Return with relations and format response
    const updatedQuotation = await repository.findOne({
        where: { quotationId },
        relations: ["projectId", "projectId.user"]
    });
    
    if (!updatedQuotation) {
        throw new Error("Quotation not found after update");
    }
    
    return formatQuotationResponse(updatedQuotation);
};

