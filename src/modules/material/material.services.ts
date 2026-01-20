const AppDataSource = require("../../data-source/typeorm.ts");
const MaterialEntity = require("./material.entity");

const repository = AppDataSource.getRepository(MaterialEntity);

// Create a new material
exports.createMaterial = async (data: {
    projectId: string;
    materialName: string;
    quantity: number;
    date: Date;
    notes?: string | null;
}) => {
    const newMaterial = repository.create({
        projectId: data.projectId,
        materialName: data.materialName,
        quantity: data.quantity,
        date: data.date,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedMaterial = await repository.save(newMaterial);
    return savedMaterial;
};

// Get material by ID
exports.getMaterialById = async (materialId: string) => {
    if (!materialId) {
        throw new Error("Material ID is required");
    }

    const material = await repository.findOne({
        where: { materialId },
        relations: ["project"]
    });

    if (!material) {
        throw new Error("Material not found");
    }

    return material;
};

// Get all materials
exports.getAllMaterials = async () => {
    const materials = await repository.find({
        relations: ["project"],
        order: { createdAt: "DESC" }
    });

    if (!materials) {
        return [];
    }
    return materials;
};

// Get materials by project ID
exports.getMaterialsByProject = async (projectId: string) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    const materials = await repository.find({
        where: { projectId },
        relations: ["project"],
        order: { createdAt: "DESC" }
    });

    return materials;
};

// Get total material count
exports.getTotalMaterialCount = async () => {
    const totalCount = await repository.count();
    return {
        totalCount: totalCount
    };
};

// Get total material count by project
exports.getTotalMaterialCountByProject = async (projectId: string) => {
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

// Update material
exports.updateMaterial = async (materialId: string, updateData: {
    materialName?: string;
    quantity?: number;
    date?: Date;
    notes?: string | null;
    projectId?: string;
}) => {
    const material = await repository.findOne({
        where: { materialId }
    });

    if (!material) {
        throw new Error("Material not found");
    }

    if (updateData.materialName !== undefined) {
        material.materialName = updateData.materialName;
    }

    if (updateData.quantity !== undefined) {
        material.quantity = updateData.quantity;
    }

    if (updateData.date !== undefined) {
        material.date = updateData.date;
    }

    if (updateData.notes !== undefined) {
        material.notes = updateData.notes;
    }

    if (updateData.projectId !== undefined) {
        material.projectId = updateData.projectId;
    }

    material.updatedAt = new Date();

    const updatedMaterial = await repository.save(material);
    return updatedMaterial;
};

// Delete material
exports.deleteMaterial = async (materialId: string) => {
    const material = await repository.findOne({
        where: { materialId }
    });

    if (!material) {
        throw new Error("Material not found");
    }

    await repository.remove(material);
    return { success: true, message: "Material deleted successfully" };
};



