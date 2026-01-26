import * as dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env" });
import "reflect-metadata";
import { DataSource } from "typeorm";

console.log(process.env.DB_HOST);
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_PUBLIC_URL as string,
  synchronize: false,
  logging: true,
  entities: [
    "src/modules/**/**.entity.ts"
  ],
  migrations: [
    "src/migrations/*.ts"
  ],
  subscribers: []
});
