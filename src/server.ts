import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Robust environment variable loading
const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "src/config/.env"),
    path.resolve(__dirname, "config/.env"), // Relative to compiled JS
];

for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`Loaded environment from: ${envPath}`);
        break;
    }
}

import app from "./app";

async function startServer() {
    try {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log("Failed to start server", error);
        process.exit(1);
    }
}
startServer();
