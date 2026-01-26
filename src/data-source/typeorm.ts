import * as dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env" });
import "reflect-metadata";
import { DataSource } from "typeorm";

console.log(process.env.DB_HOST);
const isProduction = process.env.NODE_ENV === "production" || __dirname.includes("dist");

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_PUBLIC_URL as string,
  synchronize: false,
  logging: true,
  entities: [
    isProduction ? "dist/modules/**/*.entity.js" : "src/modules/**/*.entity"
  ],
  migrations: [
    isProduction ? "dist/migrations/*.js" : "src/migrations/*"
  ],
  subscribers: []
});

