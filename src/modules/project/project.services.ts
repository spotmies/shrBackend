import prisma from "../../config/prisma.client";
import { ProjectStatus, ProjectType, Prisma } from "@prisma/client";

// Helper function to parse date strings to Date objects
const parseDate = (dateInput: string | Date): Date => {
    if (dateInput instanceof Date) {
        return dateInput;
    }
    // If it's a date string like "2024-01-15", convert to full ISO date
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateInput}`);
    }
    return date;
};

// Create a new project
export const createProject = async (data:
    {
        projectName: string,
        projectType: string,
        location: string,
        initialStatus: string,
        startDate: string | Date,
        expectedCompletion: string | Date,
        totalBudget: number,
        materialName?: string,
        quantity?: number,
        notes?: string,
        createdAt?: Date,
        updatedAt?: Date
    }) => {

    // Validate projectType
    const validProjectTypes = Object.values(ProjectType);
    if (!validProjectTypes.includes(data.projectType as ProjectType)) {
        throw new Error(`Invalid projectType: "${data.projectType}". Valid values are: ${validProjectTypes.join(', ')}`);
    }

    // Validate initialStatus
    const validStatuses = Object.values(ProjectStatus);
    if (!validStatuses.includes(data.initialStatus as ProjectStatus)) {
        throw new Error(`Invalid initialStatus: "${data.initialStatus}". Valid values are: ${validStatuses.join(', ')}`);
    }


    const newProject = await prisma.project.create({
        data: {
            projectName: data.projectName,
            projectType: data.projectType as ProjectType,
            location: data.location,
            initialStatus: data.initialStatus as ProjectStatus,
            startDate: parseDate(data.startDate),
            expectedCompletion: parseDate(data.expectedCompletion),
            totalBudget: data.totalBudget,
            materialName: data.materialName || "",
            quantity: data.quantity || 0,
            notes: data.notes || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    return newProject;
}

// Get project by ID
export const getProjectByProjectId = async (projectId: string) => {

    if (!projectId) {
        throw new Error("Project not exists");
    }
    const project = await prisma.project.findUnique({
        where: { projectId },
        include: {
            members: true      // Include Members details instead of removed Owner/Supervisor
        }
    });
    if (!project) {
        throw new Error("Project not found");
    }
    return project;
};

// Get all projects
export const getAllTheProjects = async (search?: string) => {
    const whereClause: any = {};

    if (search) {
        whereClause.OR = [
            { projectName: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { materialName: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } }
        ];
    }

    const projects = await prisma.project.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });

    if (!projects) {
        return [];
    }
    return projects;
};

// Update project
export const updateProject = async (projectId: string, updateData: {
    projectName?: string,
    projectType?: string,
    location?: string,
    initialStatus?: string,
    startDate?: string | Date,
    expectedCompletion?: string | Date,
    totalBudget?: number,
    materialName?: string,
    quantity?: number,
    notes?: string,
    updatedAt?: Date
} | undefined | null) => {
    // Check if updateData is provided
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error("No update data provided. Please provide at least one field to update.");
    }

    const project = await prisma.project.findUnique({ where: { projectId } });

    if (!project) {
        throw new Error("Project not found");
    }

    const dataToUpdate: Prisma.ProjectUpdateInput = {
        updatedAt: new Date(),
    };

    if (updateData.projectName !== undefined) dataToUpdate.projectName = updateData.projectName;

    if (updateData.projectType !== undefined) {
        // Validate projectType
        const validProjectTypes = Object.values(ProjectType);
        if (!validProjectTypes.includes(updateData.projectType as ProjectType)) {
            throw new Error(`Invalid projectType: "${updateData.projectType}". Valid values are: ${validProjectTypes.join(', ')}`);
        }
        dataToUpdate.projectType = updateData.projectType as ProjectType;
    }

    if (updateData.location !== undefined) dataToUpdate.location = updateData.location;

    if (updateData.initialStatus !== undefined) {
        // Validate initialStatus
        const validStatuses = Object.values(ProjectStatus);
        if (!validStatuses.includes(updateData.initialStatus as ProjectStatus)) {
            throw new Error(`Invalid initialStatus: "${updateData.initialStatus}". Valid values are: ${validStatuses.join(', ')}`);
        }
        dataToUpdate.initialStatus = updateData.initialStatus as ProjectStatus;
    }

    if (updateData.startDate !== undefined) dataToUpdate.startDate = parseDate(updateData.startDate);
    if (updateData.expectedCompletion !== undefined) dataToUpdate.expectedCompletion = parseDate(updateData.expectedCompletion);
    if (updateData.totalBudget !== undefined) dataToUpdate.totalBudget = updateData.totalBudget;
    if (updateData.materialName !== undefined) dataToUpdate.materialName = updateData.materialName;
    if (updateData.quantity !== undefined) dataToUpdate.quantity = updateData.quantity;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    const updatedProject = await prisma.project.update({
        where: { projectId },
        data: dataToUpdate,
    });

    return updatedProject;
};

// Delete project
export const deleteProject = async (projectId: string) => {
    const project = await prisma.project.findUnique({ where: { projectId } });

    if (!project) {
        throw new Error("Project not found");
    }

    await prisma.project.delete({
        where: { projectId },
    });

    return { success: true, message: "Project deleted successfully" };
};
