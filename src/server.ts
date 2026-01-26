const app = require("./app").default || require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });

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
