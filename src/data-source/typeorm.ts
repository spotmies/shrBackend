const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
require("reflect-metadata");
const { DataSource } = require("typeorm");


console.log(process.env.DB_HOST);
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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

module.exports = AppDataSource ;
module.exports.default = AppDataSource;