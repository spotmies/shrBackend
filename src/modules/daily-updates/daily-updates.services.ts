import { AppDataSource } from "../../data-source/typeorm";
import { DailyUpdates } from "./daily-updates.entity";
import { fileUploadService } from "../../services/fileUpload.service";

import { ProjectEntity } from "../project/project.entity";

const repository = AppDataSource.getRepository(DailyUpdates);
const projectRepository = AppDataSource.getRepository(ProjectEntity);

// Create a new daily update
export const createDailyUpdate = async (
    data: {
        constructionStage: string;
        description?: string | null;
        projectId?: string | null;
        rawMaterials?: Array<{
            materialName: string;
            quantity: number;
            notes?: string;
        }> | null;
        status?: string;
    },
    image?: any,
    video?: any
) => {
    // Validate construction stage
    const validStages = ["Foundation", "Framing", "Plumbing & Electrical", "Interior Walls", "Painting", "Finishing"];
    if (!validStages.includes(data.constructionStage)) {
        throw new Error(`Invalid construction stage. Must be one of: ${validStages.join(", ")}`);
    }

    // Validate status if provided
    if (data.status !== undefined) {
        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(data.status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
    }

    // Validate required fields
    if (!data.constructionStage) {
        throw new Error("Construction stage is required");
    }

    // Validate rawMaterials structure if provided
    if (data.rawMaterials && Array.isArray(data.rawMaterials)) {
        for (const material of data.rawMaterials) {
            if (!material.materialName || material.materialName.trim() === "") {
                throw new Error("Material name is required for each raw material");
            }
            if (material.quantity === undefined || material.quantity < 0) {
                throw new Error("Quantity must be a non-negative number for each raw material");
            }
        }
    }

    // Validate projectId if provided
    let validProjectId: string | null = null;
    if (data.projectId && data.projectId.trim() !== "") {
        // Check if project exists
        const project = await projectRepository.findOne({ where: { projectId: data.projectId } });
        if (!project) {
            throw new Error(`Project with ID ${data.projectId} not found`);
        }
        validProjectId = data.projectId;
    }

    // Upload image to Supabase if provided
    let imageUrl: string | null = null;
    if (image) {
        try {
            imageUrl = await fileUploadService.uploadFile({
                file: image,
                bucket: 'uploads',
                folder: 'daily-updates/images'
            });
        } catch (error) {
            console.error("Error uploading image to Supabase:", error);
            throw new Error("Failed to upload image to storage");
        }
    }

    // Upload video to Supabase if provided
    let videoUrl: string | null = null;
    if (video) {
        try {
            videoUrl = await fileUploadService.uploadFile({
                file: video,
                bucket: 'uploads',
                folder: 'daily-updates/videos'
            });
        } catch (error) {
            console.error("Error uploading video to Supabase:", error);
            throw new Error("Failed to upload video to storage");
        }
    }

    const newDailyUpdate = repository.create({
        constructionStage: data.constructionStage,
        description: data.description || null,
        projectId: validProjectId,
        rawMaterials: data.rawMaterials || [],
        status: data.status || "pending",
        imageUrl: imageUrl,
        imageName: image ? image.originalname : null,
        imageType: image ? image.mimetype : null,
        videoUrl: videoUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedDailyUpdate = await repository.save(newDailyUpdate);
    return savedDailyUpdate;
};

// Get daily update by ID
export const getDailyUpdateById = async (dailyUpdateId: string) => {
    if (!dailyUpdateId) {
        throw new Error("Daily update ID is required");
    }

    const dailyUpdate = await repository.findOne({
        where: { dailyUpdateId },
    });

    if (!dailyUpdate) {
        throw new Error("Daily update not found");
    }

    return dailyUpdate;
};

// Get all daily updates
export const getAllDailyUpdates = async () => {
    const dailyUpdates = await repository.find({
        order: { createdAt: "DESC" },
    });

    if (!dailyUpdates) {
        return [];
    }
    return dailyUpdates;
};

// Get daily updates by construction stage
export const getDailyUpdatesByStage = async (constructionStage: string) => {
    const validStages = ["Foundation", "Framing", "Plumbing & Electrical", "Interior Walls", "Painting", "Finishing"];
    if (!validStages.includes(constructionStage)) {
        throw new Error(`Invalid construction stage. Must be one of: ${validStages.join(", ")}`);
    }

    const dailyUpdates = await repository.find({
        where: { constructionStage },
        order: { createdAt: "DESC" },
    });

    if (!dailyUpdates) {
        return [];
    }

    return dailyUpdates;
};

// Update daily update
export const updateDailyUpdate = async (
    dailyUpdateId: string,
    updateData: {
        constructionStage?: string;
        description?: string | null;
        projectId?: string | null;
        rawMaterials?: Array<{
            materialName: string;
            quantity: number;
            notes?: string;
        }> | null;
        status?: string;
    },
    image?: any,
    video?: any
) => {
    const dailyUpdate = await repository.findOne({
        where: { dailyUpdateId },
    });

    if (!dailyUpdate) {
        throw new Error("Daily update not found");
    }

    // Validate and update construction stage if provided
    if (updateData.constructionStage !== undefined) {
        const validStages = ["Foundation", "Framing", "Plumbing & Electrical", "Interior Walls", "Painting", "Finishing"];
        if (!validStages.includes(updateData.constructionStage)) {
            throw new Error(`Invalid construction stage. Must be one of: ${validStages.join(", ")}`);
        }
        dailyUpdate.constructionStage = updateData.constructionStage;
    }

    // Validate and update status if provided
    if (updateData.status !== undefined) {
        const validStatuses = ["pending", "approved", "rejected"];
        if (!validStatuses.includes(updateData.status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
        dailyUpdate.status = updateData.status;
    }

    // Update description if provided
    if (updateData.description !== undefined) {
        dailyUpdate.description = updateData.description || null;
    }

    // Update projectId if provided
    if (updateData.projectId !== undefined) {
        if (updateData.projectId && updateData.projectId.trim() !== "") {
            const project = await projectRepository.findOne({ where: { projectId: updateData.projectId } });
            if (!project) {
                throw new Error(`Project with ID ${updateData.projectId} not found`);
            }
            dailyUpdate.projectId = updateData.projectId;
        } else {
            dailyUpdate.projectId = null;
        }
    }

    // Update rawMaterials if provided
    if (updateData.rawMaterials !== undefined) {
        if (Array.isArray(updateData.rawMaterials)) {
            // Validate rawMaterials structure
            for (const material of updateData.rawMaterials) {
                if (!material.materialName || material.materialName.trim() === "") {
                    throw new Error("Material name is required for each raw material");
                }
                if (material.quantity === undefined || material.quantity < 0) {
                    throw new Error("Quantity must be a non-negative number for each raw material");
                }
            }
            dailyUpdate.rawMaterials = updateData.rawMaterials;
        } else {
            dailyUpdate.rawMaterials = null;
        }
    }

    // Update image if provided
    if (image) {
        try {
            const imageUrl = await fileUploadService.uploadFile({
                file: image,
                bucket: 'uploads',
                folder: 'daily-updates/images'
            });
            dailyUpdate.imageUrl = imageUrl;
            dailyUpdate.imageName = image.originalname;
            dailyUpdate.imageType = image.mimetype;
        } catch (error) {
            console.error("Error uploading image to Supabase:", error);
            throw new Error("Failed to upload image to storage");
        }
    }

    // Update video if provided
    if (video) {
        try {
            const videoUrl = await fileUploadService.uploadFile({
                file: video,
                bucket: 'uploads',
                folder: 'daily-updates/videos'
            });
            dailyUpdate.videoUrl = videoUrl;
        } catch (error) {
            console.error("Error uploading video to Supabase:", error);
            throw new Error("Failed to upload video to storage");
        }
    }

    // Always update the updatedAt timestamp
    dailyUpdate.updatedAt = new Date();

    const updatedDailyUpdate = await repository.save(dailyUpdate);
    return updatedDailyUpdate;
};

// Delete daily update
export const deleteDailyUpdate = async (dailyUpdateId: string) => {
    if (!dailyUpdateId) {
        throw new Error("Daily update ID is required");
    }

    const dailyUpdate = await repository.findOne({
        where: { dailyUpdateId },
    });

    if (!dailyUpdate) {
        throw new Error("Daily update not found");
    }

    await repository.remove(dailyUpdate);
    return { success: true, message: "Daily update deleted successfully" };
};

// Get daily update image
export const getDailyUpdateImage = async (dailyUpdateId: string) => {
    if (!dailyUpdateId) {
        throw new Error("Daily update ID is required");
    }

    const dailyUpdate = await repository.findOne({
        where: { dailyUpdateId },
        select: ["dailyUpdateId", "imageName", "imageType", "imageUrl", "videoUrl", "createdAt"],
    });

    if (!dailyUpdate) {
        throw new Error("Daily update not found");
    }

    return {
        dailyUpdateId: dailyUpdate.dailyUpdateId,
        imageName: dailyUpdate.imageName,
        imageType: dailyUpdate.imageType,
        imageUrl: dailyUpdate.imageUrl,
        videoUrl: dailyUpdate.videoUrl,
        createdAt: dailyUpdate.createdAt,
    };
};

