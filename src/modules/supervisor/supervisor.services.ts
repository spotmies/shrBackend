const AppDataSource = require("../../data-source/typeorm.ts");
const SupervisorEntity = require("./supervisor.entity");
const UserEntity = require("../user/user.entity");
const ProjectEntity = require("../project/project.entity");
const bcrypt = require("bcrypt");

const repository = AppDataSource.getRepository(SupervisorEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const projectRepository = AppDataSource.getRepository(ProjectEntity);

// Create a new supervisor
exports.createSupervisor = async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    status?: string;
}) => {
    // Check if supervisor with same email already exists
    const existingSupervisor = await repository.findOne({
        where: { email: data.email }
    });

    if (existingSupervisor) {
        throw new Error("Supervisor already exists with this email");
    }

    // Check if user with same email already exists
    const existingUser = await userRepository.findOne({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash password
    if (!data.password || data.password.trim() === "") {
        throw new Error("Password is required for supervisor");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user account for authentication
    const newUser = userRepository.create({
        userName: data.fullName,
        role: "supervisor",
        email: data.email,
        password: hashedPassword,
        contact: data.phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedUser = await userRepository.save(newUser);

    // Create supervisor record
    const newSupervisor = repository.create({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        status: data.status || "Active",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedSupervisor = await repository.save(newSupervisor);
    
    // Remove password from response
    const { password, ...supervisorWithoutPassword } = savedSupervisor;
    
    // Return supervisor data with user info
    return {
        ...supervisorWithoutPassword,
        userId: savedUser.userId
    };
};

// Get supervisor by ID
exports.getSupervisorById = async (supervisorId: string) => {
    if (!supervisorId) {
        throw new Error("Supervisor ID is required");
    }

    const supervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!supervisor) {
        throw new Error("Supervisor not found");
    }

    // Get assigned projects count
    const projects = await projectRepository.find({
        where: { supervisorId },
        relations: ["user"]
    });

    // Remove password from response and add projects count
    const { password, ...supervisorWithoutPassword } = supervisor;
    return {
        ...supervisorWithoutPassword,
        assignedProjectsCount: projects.length,
        projects: projects
    };
};

// Get all supervisors
exports.getAllSupervisors = async () => {
    const supervisors = await repository.find({
        order: { createdAt: "DESC" }
    });

    if (!supervisors) {
        return [];
    }
    
    // Get projects count for each supervisor
    const supervisorsWithCounts = await Promise.all(
        supervisors.map(async (supervisor: InstanceType<typeof SupervisorEntity>) => {
            const projectsCount = await projectRepository.count({
                where: { supervisorId: supervisor.supervisorId }
            });
            
            const { password, ...supervisorWithoutPassword } = supervisor;
            return {
                ...supervisorWithoutPassword,
                assignedProjectsCount: projectsCount
            };
        })
    );
    
    return supervisorsWithCounts;
};

// Update supervisor
exports.updateSupervisor = async (supervisorId: string, updateData: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string | null;
    status?: string;
}) => {
    const supervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!supervisor) {
        throw new Error("Supervisor not found");
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== supervisor.email) {
        const existingSupervisor = await repository.findOne({
            where: { email: updateData.email }
        });

        if (existingSupervisor) {
            throw new Error("Email already exists for another supervisor");
        }
    }

    // Only update fields that are provided
    if (updateData.fullName !== undefined) supervisor.fullName = updateData.fullName;
    if (updateData.email !== undefined) supervisor.email = updateData.email;
    if (updateData.phoneNumber !== undefined) supervisor.phoneNumber = updateData.phoneNumber;
    if (updateData.status !== undefined) supervisor.status = updateData.status;
    
    // Handle password update (hash if provided)
    if (updateData.password !== undefined) {
        if (updateData.password === null || updateData.password.trim() === "") {
            supervisor.password = null;
        } else {
            supervisor.password = await bcrypt.hash(updateData.password, 10);
        }
    }

    supervisor.updatedAt = new Date();

    const updatedSupervisor = await repository.save(supervisor);
    
    // Remove password from response
    const { password, ...supervisorWithoutPassword } = updatedSupervisor;
    return supervisorWithoutPassword;
};

// Delete supervisor
exports.deleteSupervisor = async (supervisorId: string) => {
    const supervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!supervisor) {
        throw new Error("Supervisor not found");
    }

    const deletedSupervisor = await repository.remove(supervisor);
    return deletedSupervisor;
};

// Assign project to supervisor
exports.assignProjectToSupervisor = async (supervisorId: string, projectId: string) => {
    // Check if supervisor exists
    const supervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!supervisor) {
        throw new Error("Supervisor not found");
    }

    // Check if project exists
    const project = await projectRepository.findOne({
        where: { projectId },
        relations: ["user", "supervisor"]
    });

    if (!project) {
        throw new Error("Project not found");
    }

    // Check if project is already assigned to another supervisor
    if (project.supervisorId && project.supervisorId !== supervisorId) {
        throw new Error("Project is already assigned to another supervisor");
    }

    // Assign project to supervisor by setting supervisorId on project
    project.supervisorId = supervisorId;
    project.updatedAt = new Date();

    const updatedProject = await projectRepository.save(project);

    // Get supervisor
    const updatedSupervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!updatedSupervisor) {
        throw new Error("Supervisor not found after update");
    }

    // Get projects count
    const projectsCount = await projectRepository.count({
        where: { supervisorId }
    });

    // Remove password from response
    const { password, ...supervisorWithoutPassword } = updatedSupervisor;

    return {
        ...supervisorWithoutPassword,
        assignedProjectsCount: projectsCount,
        assignedProject: updatedProject
    };
};

// Remove project from supervisor
exports.removeProjectFromSupervisor = async (supervisorId: string, projectId: string) => {
    // Check if supervisor exists
    const supervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!supervisor) {
        throw new Error("Supervisor not found");
    }

    // Check if project exists and is assigned to this supervisor
    const project = await projectRepository.findOne({
        where: { projectId }
    });

    if (!project) {
        throw new Error("Project not found");
    }

    if (project.supervisorId !== supervisorId) {
        throw new Error("Project is not assigned to this supervisor");
    }

    // Remove project assignment by setting supervisorId to null
    project.supervisorId = null;
    project.updatedAt = new Date();

    await projectRepository.save(project);

    // Get supervisor
    const updatedSupervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!updatedSupervisor) {
        throw new Error("Supervisor not found after update");
    }

    // Get projects count
    const projectsCount = await projectRepository.count({
        where: { supervisorId }
    });

    // Remove password from response
    const { password, ...supervisorWithoutPassword } = updatedSupervisor;
    return {
        ...supervisorWithoutPassword,
        assignedProjectsCount: projectsCount
    };
};

// Get assigned projects count for a supervisor
exports.getAssignedProjectsCount = async (supervisorId: string) => {
    if (!supervisorId) {
        throw new Error("Supervisor ID is required");
    }

    const supervisor = await repository.findOne({
        where: { supervisorId }
    });

    if (!supervisor) {
        throw new Error("Supervisor not found");
    }

    // Get assigned projects
    const projects = await projectRepository.find({
        where: { supervisorId },
        relations: ["user"]
    });

    return {
        supervisorId: supervisor.supervisorId,
        fullName: supervisor.fullName,
        email: supervisor.email,
        assignedProjectsCount: projects.length,
        projects: projects
    };
};

