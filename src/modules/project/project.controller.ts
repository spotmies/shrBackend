import type { Request,Response} from "express";
const ProjectServices = require("./project.services");

/**
 * @swagger
 * /api/project/createproject:
 *   post:
 *     summary: Create a new project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request - Project already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


//post
exports.createProject = async(req: Request,res: Response)=>{
    try{

        const projectData = await ProjectServices.createProject(req.body);

        return res.status(201).json({
            success:true,
            message:"Project created successfully",
            data:projectData,
        });

    }catch(error){
        return res.status(400).json({
            success:false,
            message:error instanceof Error ? error.message : String(error),
            
        });
    }

}

/**
 * @swagger
 * /api/project/getproject/{projectId}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request - Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//getId
exports.getProjectById = async(req:Request,res:Response)=>{
    try{
        const projectId = req.params.projectId;
        const project = await ProjectServices.getProjectByProjectId(projectId);

        return res.status(200).json({
            success:true,
            message:"Project fetched successfully",
            data:project,
        })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:error instanceof Error ? error.message: String(error),
        })
    }
}


/**
 * @swagger
 * /api/project/getallprojects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//get
exports.getAllProjects = async(req:Request,res:Response)=>{
    try{
          const projects = await ProjectServices.getAllTheProjects();

          return res.status(200).json({
            success:true,
            message:"Projects fetched successfully",
            data:projects
          })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:error instanceof Error ? error.message: String(error),
        })
    }
}


/**
 * @swagger
 * /api/project/updateproject/{projectId}:
 *   put:
 *     summary: Update a project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["projectName", "projectType", "location", "initialStatus", "startDate", "expectedCompletion", "totalBudget", "materialName", "quantity", "notes", "userId"]
 *             properties:
 *               projectName:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Smart Home Project"
 *               projectType:
 *                 type: string
 *                 enum: ["villa", "apartment", "building"]
 *                 example: "villa"
 *               location:
 *                 type: string
 *                 maxLength: 255
 *                 example: "123 Main St, City"
 *               initialStatus:
 *                 type: string
 *                 enum: ["Planning", "Inprogress", "OnHold"]
 *                 example: "Planning"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               expectedCompletion:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               totalBudget:
 *                 type: number
 *                 format: decimal
 *                 example: 500000.00
 *               materialName:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Cement"
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               notes:
 *                 type: string
 *                 example: "Additional notes about the project"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "d1f8ac24-57c1-47aa-ae6a-092de6e55553"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request - Project not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//put
exports.updateProject = async(req:Request , res:Response)=>{
    try{
        const projectId = req.params.projectId;

        const updatedData = await ProjectServices.updateProject(projectId, req.body);

        return res.status(200).json({
            success:true,
            message:"Project updated successfully",
            data:updatedData,
        })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:error instanceof Error ? error.message : String(error),
        })
    }
}


/**
 * @swagger
 * /api/project/deleteproject/{projectId}:
 *   delete:
 *     summary: Delete a project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: boolean
 *                         message:
 *                           type: string
 *       400:
 *         description: Bad request - Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//delete
exports.deleteProject = async(req:Request,res:Response)=>{
    try{
        const projectId = req.params.projectId;
        const deletedData = await ProjectServices.deleteProject(projectId)
        return res.status(200).json({
            success:true,
            message:"Project deleted successfully",
            data:deletedData,
        })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:error instanceof Error ? error.message: String(error),
        })
    }
}
