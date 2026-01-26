import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, ".env") });

const connectionString = process.env.DATABASE_PUBLIC_URL;

if (!connectionString) {
    throw new Error("DATABASE_PUBLIC_URL is not defined in environment variables");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;

