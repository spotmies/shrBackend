import prisma from "../../config/prisma.client";

// Create a new material
export const createMaterial = async (data: {
    projectId: string;
    materialName: string;
    quantity: number;
    date: Date | string;
    notes?: string | null;
}) => {
    // Ensure date is a valid Date object
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format. Expected ISO-8601 DateTime string.");
    }

    const newMaterial = await prisma.material.create({
        data: {
            projectId: data.projectId,
            materialName: data.materialName,
            quantity: data.quantity,
            date: parsedDate,
            notes: data.notes || null,
            vendor: data.vendor || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    return newMaterial;
};

// Get material by ID
export const getMaterialById = async (materialId: string) => {
    if (!materialId) {
        throw new Error("Material ID is required");
    }

    const material = await prisma.material.findUnique({
        where: { materialId },
        include: { project: true }
    });

    if (!material) {
        throw new Error("Material not found");
    }

    return material;
};

// Get all materials
export const getAllMaterials = async () => {
    const materials = await prisma.material.findMany({
        include: { project: true },
        orderBy: { createdAt: "desc" }
    });

    if (!materials) {
        return [];
    }
    return materials;
};

// Get materials by project ID
export const getMaterialsByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const materials = await prisma.material.findMany({
        where: { projectId },
        include: { project: true },
        orderBy: { createdAt: "desc" }
    });

    return materials;
};



// Get total material count by project
export const getTotalMaterialCountByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const count = await prisma.material.count({
        where: { projectId }
    });

    return {
        projectId: projectId,
        totalCount: count
    };
};

// Update material
export const updateMaterial = async (materialId: string, updateData: {
    materialName?: string;
    quantity?: number;
    date?: Date | string;
    notes?: string | null;
    vendor?: string | null;
    projectId?: string;
}) => {
    const material = await prisma.material.findUnique({
        where: { materialId }
    });

    if (!material) {
        throw new Error("Material not found");
    }

    const dataToUpdate: any = {
        updatedAt: new Date(),
    };

    if (updateData.materialName !== undefined) {
        dataToUpdate.materialName = updateData.materialName;
    }

    if (updateData.quantity !== undefined) {
        dataToUpdate.quantity = updateData.quantity;
    }

    if (updateData.date !== undefined) {
        const parsedDate = new Date(updateData.date);
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Invalid date format. Expected ISO-8601 DateTime string.");
        }
        dataToUpdate.date = parsedDate;
    }

    if (updateData.notes !== undefined) {
        dataToUpdate.notes = updateData.notes;
    }

    if (updateData.vendor !== undefined) {
        dataToUpdate.vendor = updateData.vendor;
    }

    if (updateData.projectId !== undefined) {
        dataToUpdate.projectId = updateData.projectId;
    }

    const updatedMaterial = await prisma.material.update({
        where: { materialId },
        data: dataToUpdate,
    });
    return updatedMaterial;
};

// Delete material
export const deleteMaterial = async (materialId: string) => {
    const material = await prisma.material.findUnique({
        where: { materialId }
    });

    if (!material) {
        throw new Error("Material not found");
    }

    await prisma.material.delete({
        where: { materialId }
    });
    return { success: true, message: "Material deleted successfully" };
};
