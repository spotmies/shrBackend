import prisma from "../../config/prisma.client";
import { DocumentType, Document } from "@prisma/client";

export const createDocument = async (
    data: {
        documentType: string;
        description?: string;
        projectId?: string;
        createdAt?: Date;
        updatedAt?: Date;
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

    if (!file || !file.buffer) {
        throw new Error("File is required");
    }

    const validTypes = ["Agreement", "plans", "permit", "others"];
    if (!validTypes.includes(data.documentType)) {
        throw new Error(`Invalid document type. Must be one of: ${validTypes.join(", ")}`);
    }

    const newDocument = await prisma.document.create({
        data: {
            documentType: data.documentType as DocumentType,
            description: data.description || null,
            projectId: data.projectId || null,
            fileData: file.buffer as any,
            fileName: file.originalname,
            fileType: file.mimetype,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    return newDocument;
};


export const getDocumentById = async (documentId: string) => {
    if (!documentId) {
        throw new Error("Document ID is required");
    }

    const document = await prisma.document.findUnique({
        where: { documentId },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    return document;
};


export const getAllDocuments = async (filters?: {
    documentType?: string;
    projectId?: string;
}) => {
    const where: any = {};

    if (filters?.documentType) {
        const validTypes = ["Agreement", "plans", "permit", "others"];
        if (validTypes.includes(filters.documentType)) {
            where.documentType = filters.documentType as DocumentType;
        }
    }

    if (filters?.projectId) {
        where.projectId = filters.projectId;
    }

    const documents = await prisma.document.findMany({
        where,
        orderBy: {
            createdAt: "desc", // Most recent first
        },
    });

    if (!documents) {
        return [];
    }

    return documents;
};


export const getDocumentsByType = async (documentType: string) => {
    const validTypes = ["Agreement", "plans", "permit", "others"];
    if (!validTypes.includes(documentType)) {
        throw new Error(`Invalid document type. Must be one of: ${validTypes.join(", ")}`);
    }

    const documents = await prisma.document.findMany({
        where: { documentType: documentType as DocumentType },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!documents) {
        return [];
    }

    return documents;
};


export const getDocumentsByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    // Get the project details
    const project = await prisma.project.findUnique({
        where: { projectId }
    });

    if (!project) {
        throw new Error("Project not found");
    }

    // Get all documents for this project
    const documents = await prisma.document.findMany({
        where: { projectId },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!documents || documents.length === 0) {
        return {
            project: {
                projectId: project.projectId,
                projectName: project.projectName || "",
                projectType: project.projectType || "",
                location: project.location || "",
                totalBudget: parseFloat(project.totalBudget.toString()) || 0,
                startDate: project.startDate,
                expectedCompletion: project.expectedCompletion,
            },
            documents: []
        };
    }

    // Format documents with fileName and documentType name
    const formattedDocuments = documents.map((doc: any) => ({
        documentId: doc.documentId,
        fileName: doc.fileName,
        documentType: doc.documentType,
        fileType: doc.fileType,
        description: doc.description || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    }));

    return {
        project: {
            projectId: project.projectId,
            projectName: project.projectName || "",
            projectType: project.projectType || "",
            location: project.location || "",
            totalBudget: parseFloat(project.totalBudget.toString()) || 0,
            startDate: project.startDate,
            expectedCompletion: project.expectedCompletion,
        },
        documents: formattedDocuments
    };
};


export const updateDocument = async (
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
    const document = await prisma.document.findUnique({ where: { documentId } });

    if (!document) {
        throw new Error("Document not found");
    }

    const dataToUpdate: any = {
        updatedAt: new Date(),
    }

    // Update document type if provided
    if (updateData.documentType !== undefined) {
        const validTypes = ["Agreement", "plans", "permit", "others"];
        if (!validTypes.includes(updateData.documentType)) {
            throw new Error(`Invalid document type. Must be one of: ${validTypes.join(", ")}`);
        }
        dataToUpdate.documentType = updateData.documentType as DocumentType;
    }

    // Update description if provided
    if (updateData.description !== undefined) {
        dataToUpdate.description = updateData.description || null;
    }

    // Update project ID if provided
    if (updateData.projectId !== undefined) {
        dataToUpdate.projectId = updateData.projectId;
    }

    // Update file if provided
    if (file) {
        dataToUpdate.fileData = file.buffer;
        dataToUpdate.fileName = file.originalname;
        dataToUpdate.fileType = file.mimetype;
    }

    const updatedDocument = await prisma.document.update({
        where: { documentId },
        data: dataToUpdate,
    });

    return updatedDocument;
};


export const deleteDocument = async (documentId: string) => {
    if (!documentId) {
        throw new Error("Document ID is required");
    }

    const document = await prisma.document.findUnique({ where: { documentId } });

    if (!document) {
        throw new Error("Document not found");
    }

    await prisma.document.delete({ where: { documentId } });

    return { success: true, message: "Document deleted successfully" };
};


export const getDocumentFile = async (documentId: string) => {
    if (!documentId) {
        throw new Error("Document ID is required");
    }

    const document = await prisma.document.findUnique({
        where: { documentId },
        select: {
            documentId: true,
            fileName: true,
            fileType: true,
            fileData: true,
            documentType: true,
            createdAt: true,
        },
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

/**
 * Get total count of documents by type
 * Returns counts for Agreement, plans, permit, and others
 */
export const getDocumentCountsByType = async () => {
    // Get counts for each document type
    const counts = await prisma.document.groupBy({
        by: ['documentType'],
        _count: {
            documentId: true
        }
    });

    // Initialize all types with 0
    const result: any = {
        Agreement: 0,
        plans: 0,
        permit: 0,
        others: 0,
        total: 0
    };

    // Map the counts to result object
    counts.forEach((item: any) => {
        const type = item.documentType;
        const count = item._count.documentId;
        if (result.hasOwnProperty(type)) {
            result[type] = count;
            result.total += count;
        }
    });

    return result;
};


