import prisma from "../../config/prisma.client";
import { ProjectStatus, ProjectType, Prisma } from "@prisma/client";

// Create a new project
export const createProject = async (data:
    {
        projectName: string,
        projectType: string,
        location: string,
        initialStatus: string,
        startDate: Date,
        expectedCompletion: Date,
        totalBudget: number,
        materialName: string,
        quantity: number,
        notes: string,
        userId: string,
        createdAt: Date,
        updatedAt: Date
    }) => {

    const newProject = await prisma.project.create({
        data: {
            projectName: data.projectName,
            projectType: data.projectType as ProjectType,
            location: data.location,
            initialStatus: data.initialStatus as ProjectStatus,
            startDate: data.startDate,
            expectedCompletion: data.expectedCompletion,
            totalBudget: data.totalBudget,
            materialName: data.materialName,
            quantity: data.quantity,
            notes: data.notes,
            userId: data.userId,
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
    });
    if (!project) {
        throw new Error("Project not found");
    }
    return project;
};

// Get all projects
export const getAllTheProjects = async () => {
    const projects = await prisma.project.findMany();

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
    startDate?: Date,
    expectedCompletion?: Date,
    totalBudget?: number,
    materialName?: string,
    quantity?: number,
    notes?: string,
    userId?: string,
    updatedAt?: Date
}) => {
    const project = await prisma.project.findUnique({ where: { projectId } });

    if (!project) {
        throw new Error("Project not found");
    }

    const dataToUpdate: Prisma.ProjectUpdateInput = {
        updatedAt: new Date(),
    };

    if (updateData.projectName !== undefined) dataToUpdate.projectName = updateData.projectName;
    if (updateData.projectType !== undefined) dataToUpdate.projectType = updateData.projectType as ProjectType;
    if (updateData.location !== undefined) dataToUpdate.location = updateData.location;
    if (updateData.initialStatus !== undefined) dataToUpdate.initialStatus = updateData.initialStatus as ProjectStatus;
    if (updateData.startDate !== undefined) dataToUpdate.startDate = updateData.startDate;
    if (updateData.expectedCompletion !== undefined) dataToUpdate.expectedCompletion = updateData.expectedCompletion;
    if (updateData.totalBudget !== undefined) dataToUpdate.totalBudget = updateData.totalBudget;
    if (updateData.materialName !== undefined) dataToUpdate.materialName = updateData.materialName;
    if (updateData.quantity !== undefined) dataToUpdate.quantity = updateData.quantity;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.userId !== undefined) dataToUpdate.user = { connect: { userId: updateData.userId } };

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
