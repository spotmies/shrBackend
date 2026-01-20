import type { Request, Response } from "express";
const UserServices = require("./user.services.ts");

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - User already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 */
//POST
exports.createUser = async (req: Request, res: Response) => {
    try {
        const userData = await UserServices.createUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userData,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//GETBYID
exports.getuserById = async(req:Request,res:Response)=>{
   try{
          const userId = req.params.userId
          const user = await UserServices.getUserById(userId);

          return res.status(200).json({
                success:true,
                message: "User fetched successfully",
                data:user
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
 * /api/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//GETALL
exports.getAllUsers = async(req:Request,res:Response)=>{
    try{
        const users = await UserServices.getAllUsers();
       return res.status(200).json({
        success:true,
        message: "Users feched successfully",
        data:users
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
 * /api/user/{userId}:
 *   put:
 *     summary: Update a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userName:
     *                 type: string
     *                 maxLength: 255
     *                 example: "John Doe"
     *               role:
     *                 type: string
     *                 enum: ["admin", "user", "supervisor"]
     *                 example: "user"
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john.doe@example.com"
     *               contact:
     *                 type: string
     *                 maxLength: 15
     *                 example: "9876543210"
     *               estimatedInvestment:
     *                 type: number
     *                 format: decimal
     *                 example: 50000.00
     *                 description: Estimated investment amount (optional)
     *               notes:
     *                 type: string
     *                 example: "Additional notes about the user"
     *                 description: Notes about the user (optional)
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - User not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 */
//PUT
exports.updateUser = async(req:Request, res:Response)=>{
    try{
        const userId = req.params.userId;

        const updatedUserData = await UserServices.updateUser(userId, req.body);

        return res.status(200).json({
             success:true,
             message:"User updated successfully",
             data:updatedUserData
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
 * /api/user/{userId}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       403:
 *         description: Forbidden - Admin privileges required
 */
//DELETE
exports.deleteUser = async(req:Request,res:Response)=>{
    try{
        const userId = req.params.userId;

        const deletedUserData = await UserServices.deleteUser(userId);

        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
            data:deletedUserData
        })
    }catch(error){
        return res.status(404).json({
            success:false,
            message:error instanceof Error ? error.message: String(error),
        })
    }
}

/**
 * @swagger
 * /api/user/{userId}/assign-supervisor:
 *   post:
 *     summary: Assign supervisor to a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID to assign supervisor to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["supervisorId"]
 *             properties:
 *               supervisorId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Supervisor assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
exports.assignSupervisor = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { supervisorId } = req.body;

        if (!supervisorId) {
            return res.status(400).json({
                success: false,
                message: "supervisorId is required"
            });
        }

        const updatedUser = await UserServices.assignSupervisor(userId, supervisorId);

        return res.status(200).json({
            success: true,
            message: "Supervisor assigned successfully",
            data: updatedUser
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * @swagger
 * /api/user/{userId}/remove-supervisor:
 *   delete:
 *     summary: Remove supervisor from a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Supervisor removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
exports.removeSupervisor = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const updatedUser = await UserServices.removeSupervisor(userId);

        return res.status(200).json({
            success: true,
            message: "Supervisor removed successfully",
            data: updatedUser
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * @swagger
 * /api/user/supervisor/{supervisorId}:
 *   get:
 *     summary: Get all users assigned to a supervisor
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: supervisorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The supervisor's user ID
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
exports.getUsersBySupervisor = async (req: Request, res: Response) => {
    try {
        const { supervisorId } = req.params;

        const users = await UserServices.getUsersBySupervisor(supervisorId);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * @swagger
 * /api/user/supervisors/all:
 *   get:
 *     summary: Get all supervisors (users with role "supervisor")
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Supervisors fetched successfully
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
 *                         $ref: '#/components/schemas/User'
 */
exports.getAllSupervisors = async (req: Request, res: Response) => {
    try {
        const supervisors = await UserServices.getAllSupervisors();

        return res.status(200).json({
            success: true,
            message: "Supervisors fetched successfully",
            data: supervisors
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * @swagger
 * /api/user/without-supervisor:
 *   get:
 *     summary: Get all users without a supervisor assigned (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users without supervisor fetched successfully
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
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
exports.getUsersWithoutSupervisor = async (req: Request, res: Response) => {
    try {
        const users = await UserServices.getUsersWithoutSupervisor();

        return res.status(200).json({
            success: true,
            message: "Users without supervisor fetched successfully",
            data: users
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
