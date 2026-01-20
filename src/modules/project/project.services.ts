const AppDataSource = require("../../data-source/typeorm.ts");
const ProjectEntity = require("./project.entity");


const repository = AppDataSource.getRepository(ProjectEntity);

exports.createProject = async(data:
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
         userId:string,
         createdAt: Date,
         updatedAt: Date
    })=>{

   const newProject = repository.create({
 
        projectName: data.projectName,
        projectType: data.projectType,
        location: data.location,
        initialStatus: data.initialStatus,
        startDate: data.startDate,
        expectedCompletion: data.expectedCompletion,
        totalBudget: data.totalBudget,
        materialName: data.materialName,
        quantity: data.quantity,
        notes: data.notes,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
   })
  
   const savedProject = await repository.save(newProject);

   return savedProject;

}

// Get project by ID
exports.getProjectByProjectId = async (projectId: string) => {

   if(!projectId){
      throw new Error("Project not exists");
   }
    const project = await repository.findOne({ 
        where: { projectId },
       
    });    
    if (!project) {
        throw new Error("Project not found");
    } 
   return project;
};

// Get all projects
exports.getAllTheProjects = async () => {
    const projects = await repository.find();
    
    if(!projects){
        return [];
    }
    return projects;
};

// Update project
exports.updateProject = async (projectId: string, updateData: {
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
    updatedAt?:Date
}) => {
    const project = await repository.findOne({ where: { projectId } });
    
    if (!project) {
        throw new Error("Project not found");
    }
  
    Object.assign(project,updateData);
    project.updatedAt = new Date();

    const updatedProject = await repository.save(project);
    
    return updatedProject;
};

// Delete project
exports.deleteProject = async (projectId: string) => {
    const project = await repository.findOne({ where: { projectId } });
    
    if (!project) {
        throw new Error("Project not found");
    }
    
    await repository.remove(project);

    return { success: true, message: "Project deleted successfully" };
};

