const AppDataSource = require("../../data-source/typeorm.ts");
const DocumentEntity = require("./documents.entity");

const repository = AppDataSource.getRepository(DocumentEntity);


exports.createDocument = async (
    data: {
        documentType: string;
        description?: string;
        uploadedBy: string;
        projectId?: string;
        createdAt: Date;
        updatedAt: Date;
    },
    file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }
) => {
    // Validate required fields
    if (!data.documentType) {
        throw new Error("Document type is required");
    }

    if (!data.uploadedBy) {
        throw new Error("Uploaded by (admin) is required");
    }

    if (!file || !file.buffer) {
        throw new Error("File is required");
    }


    const validTypes = ["Agreement", "plans", "permit", "others"];
    if (!validTypes.includes(data.documentType)) {
        throw new Error(`Invalid document type. Must be one of: ${validTypes.join(", ")}`);
    }

    const newDocument = repository.create({
        documentType: data.documentType,
        description: data.description || null,
        uploadedBy: data.uploadedBy,
        projectId: data.projectId || null,
        fileData: file.buffer,
        fileName: file.originalname,
        fileType: file.mimetype,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedDocument = await repository.save(newDocument);

    return savedDocument;
};


exports.getDocumentById = async (documentId: string) => {
    if (!documentId) {
        throw new Error("Document ID is required");
    }

    const document = await repository.findOne({
        where: { documentId },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    return document;
};


exports.getAllDocuments = async (filters?: {
    documentType?: string;
    projectId?: string;
}) => {
    const where: any = {};

    if (filters?.documentType) {
        const validTypes = ["Agreement", "plans", "permit", "others"];
        if (validTypes.includes(filters.documentType)) {
            where.documentType = filters.documentType;
        }
    }

    if (filters?.projectId) {
        where.projectId = filters.projectId;
    }

    const documents = await repository.find({
        where,
        order: {
            createdAt: "DESC", // Most recent first
        },
    });

    if (!documents) {
        return [];
    }

    return documents;
};


exports.getDocumentsByType = async (documentType: string) => {
    const validTypes = ["Agreement", "plans", "permit", "others"];
    if (!validTypes.includes(documentType)) {
        throw new Error(`Invalid document type. Must be one of: ${validTypes.join(", ")}`);
    }

    const documents = await repository.find({
        where: { documentType },
        order: {
            createdAt: "DESC",
        },
    });

    if (!documents) {
        return [];
    }

    return documents;
};


exports.getDocumentsByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const documents = await repository.find({
        where: { projectId },
        order: {
            createdAt: "DESC",
        },
    });

    if (!documents) {
        return [];
    }

    return documents;
};


exports.updateDocument = async (
    documentId: string,
    updateData: {
        documentType?: string;
        description?: string;
        projectId?: string | null;
        updatedAt?: Date;
    },
    file?: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }
) => {
    const document = await repository.findOne({ where: { documentId } });

    if (!document) {
        throw new Error("Document not found");
    }

    // Update document type if provided
    if (updateData.documentType !== undefined) {
        const validTypes = ["Agreement", "plans", "permit", "others"];
        if (!validTypes.includes(updateData.documentType)) {
            throw new Error(`Invalid document type. Must be one of: ${validTypes.join(", ")}`);
        }
        document.documentType = updateData.documentType;
    }

    // Update description if provided
    if (updateData.description !== undefined) {
        document.description = updateData.description || null;
    }

    // Update project ID if provided
    if (updateData.projectId !== undefined) {
        document.projectId = updateData.projectId;
    }

    // Update file if provided
    if (file) {
        document.fileData = file.buffer;
        document.fileName = file.originalname;
        document.fileType = file.mimetype;
    }

    // Always update the updatedAt timestamp
    document.updatedAt = new Date();

    const updatedDocument = await repository.save(document);

    return updatedDocument;
};


exports.deleteDocument = async (documentId: string) => {
    if (!documentId) {
        throw new Error("Document ID is required");
    }

    const document = await repository.findOne({ where: { documentId } });

    if (!document) {
        throw new Error("Document not found");
    }

    await repository.remove(document);

    return { success: true, message: "Document deleted successfully" };
};


exports.getDocumentFile = async (documentId: string) => {
    if (!documentId) {
        throw new Error("Document ID is required");
    }

    const document = await repository.findOne({
        where: { documentId },
        select: ["documentId", "fileName", "fileType", "fileData", "documentType", "createdAt"],
    });

    if (!document) {
        throw new Error("Document not found");
    }

    return {
        documentId: document.documentId,
        fileName: document.fileName,
        fileType: document.fileType,
        fileData: document.fileData,
        documentType: document.documentType,
        createdAt: document.createdAt,
    };
};

