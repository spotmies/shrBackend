const AppDataSource = require("../../data-source/typeorm.ts");
const UserEntity = require("./user.entity");
const bcrypt = require("bcrypt");

const repository = AppDataSource.getRepository(UserEntity);


exports.createUser = async (data: {
    userName: string;
    role: string;
    email: string;
    password?: string | null;
    contact: string;
    estimatedInvestment?: number | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}) => {
    const existingUser = await repository.findOne({
        where: { email: data.email } // or data.userName, adjust as needed
    });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash password if provided
    let hashedPassword = null;
    if (data.password && data.password.trim() !== "") {
        hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const newUser = repository.create({
        userName: data.userName,
        role: data.role,
        email: data.email,
        password: hashedPassword,
        contact: data.contact,
        estimatedInvestment: data.estimatedInvestment || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const savedUser = await repository.save(newUser);
    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
};

exports.getUserById = async(userId : string)=>{

    if(!userId){
        throw new Error("User not exists");
    }

    const user = await repository.findOne({
        where: {userId}
    });

    if(!user){
        throw new Error("User not found");
    }

    return user;
}

exports.getAllUsers = async()=>{
    const users = await repository.find();
    if(!users){
        return []
    }
    return users
}

exports.updateUser = async(userId:String , updatedUserData:{
    userName?: string;
    role?: string;
    email?: string;
    password?: string | null;
    contact?: string;
    estimatedInvestment?: number | null;
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
})=>{
    const user = await repository.findOne({where:{userId}})

    if(!user){
        throw new Error("User not found")
    }
    
    // Only update fields that are provided
    if (updatedUserData.userName !== undefined) user.userName = updatedUserData.userName;
    if (updatedUserData.role !== undefined) user.role = updatedUserData.role;
    if (updatedUserData.email !== undefined) user.email = updatedUserData.email;
    if (updatedUserData.contact !== undefined) user.contact = updatedUserData.contact;
    if (updatedUserData.estimatedInvestment !== undefined) user.estimatedInvestment = updatedUserData.estimatedInvestment;
    if (updatedUserData.notes !== undefined) user.notes = updatedUserData.notes;
    
    // Handle password update (hash if provided)
    if (updatedUserData.password !== undefined) {
        if (updatedUserData.password === null || updatedUserData.password.trim() === "") {
            user.password = null;
        } else {
            user.password = await bcrypt.hash(updatedUserData.password, 10);
        }
    }
    
    user.updatedAt = new Date();

    const updatedUser = await repository.save(user);
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
}

exports.deleteUser = async(userId:String)=>{
    const user = await repository.findOne({where:{userId}})

    if(!user){
        throw new Error("User not found")
    }

   const deletedUser = await repository.remove(user);
   return deletedUser;
}
