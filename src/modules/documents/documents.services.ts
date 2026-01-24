import { AppDataSource } from "../../data-source/typeorm";
import { DocumentEntity } from "./documents.entity";
import { ProjectEntity } from "../project/project.entity";

const repository = AppDataSource.getRepository(DocumentEntity);
const projectRepository = AppDataSource.getRepository(ProjectEntity);


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

    const newDocument = repository.create({
        documentType: data.documentType,
        description: data.description || null,
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


export const getDocumentById = async (documentId: string) => {
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


export const getAllDocuments = async (filters?: {
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


export const getDocumentsByType = async (documentType: string) => {
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


export const getDocumentsByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    // Get the project details
    const project = await projectRepository.findOne({
        where: { projectId }
    });

    if (!project) {
        throw new Error("Project not found");
    }

    // Get all documents for this project
    const documents = await repository.find({
        where: { projectId },
        order: {
            createdAt: "DESC",
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


export const deleteDocument = async (documentId: string) => {
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


export const getDocumentFile = async (documentId: string) => {
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

/**
 * Get total count of documents by type
 * Returns counts for Agreement, plans, permit, and others
 */
export const getDocumentCountsByType = async () => {
    // Get counts for each document type
    const counts = await repository
        .createQueryBuilder("document")
        .select("document.documentType", "documentType")
        .addSelect("COUNT(document.documentId)", "count")
        .groupBy("document.documentType")
        .getRawMany();

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
        const count = parseInt(item.count, 10);
        if (result.hasOwnProperty(type)) {
            result[type] = count;
            result.total += count;
        }
    });

    return result;
};

