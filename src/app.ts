const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const projectRoutes = require("./modules/project/project.routes");
const userRoutes = require("./modules/user/user.routes")
const quotationsRoutes = require("./modules/quotations/quotations.routes")
const authRoutes = require("./modules/auth/auth.routes")
const documentsRoutes = require("./modules/documents/documents.routes")
const paymentRoutes = require("./modules/payments/payments.routes")
const supervisorRoutes = require("./modules/supervisor/supervisor.routes")
const materialRoutes = require("./modules/material/material.routes")
const expenseRoutes = require("./modules/expense/expense.routes")
const dailyUpdatesRoutes = require("./modules/daily-updates/daily-updates.routes")
const messagesRoutes = require("./modules/messages/messages.routes")
const notificationsRoutes = require("./modules/notifications/notifications.routes")
const { Request, Response } = require("express");

/* -------------------- U can have Routes N Middlewares imports-------------------- */

const app = express();


/* -------------------- Global Middlewares -------------------- */

app.use(cors());

// JSON body parser
app.use(express.json({
    limit: '10mb',
    strict: true
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* -------------------- Swagger Documentation -------------------- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.listen(env.PORT,()=>{
//     console.log(`Server is running on port ${env.PORT}`);
// });


app.use("/api/project", projectRoutes)
app.use("/api/user", userRoutes)
app.use("/api/quotations", quotationsRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/documents", documentsRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/supervisor", supervisorRoutes)
app.use("/api/material", materialRoutes)
app.use("/api/expense", expenseRoutes)
app.use("/api/daily-updates", dailyUpdatesRoutes)
app.use("/api/messages", messagesRoutes)
app.use("/api/notifications", notificationsRoutes)

// app.get("/",(req: Request,res:Response)=>{
//     return res.json({
//         msg:"Hello World",
//     });
// });

// module.exports = app;
// module.exports.default = app;
export default app;
