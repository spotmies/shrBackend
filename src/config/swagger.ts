const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SHR Homies API",
      version: "1.0.0",
      description: "API documentation for SHR Homies project management system",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token (you can get it from /api/auth/admin/login endpoint)"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              format: "uuid",
              description: "Auto-generated user ID",
            },
            userName: {
              type: "string",
              maxLength: 255,
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["admin", "user", "supervisor"],
              example: "user",
            },
            email: {
              type: "string",
              maxLength: 100,
              format: "email",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              maxLength: 255,
              nullable: true,
              description: "Hashed password (nullable)",
              example: "$2b$10$...",
            },
            contact: {
              type: "string",
              maxLength: 15,
              example: "9876543210",
            },
            estimatedInvestment: {
              type: "number",
              format: "decimal",
              nullable: true,
              description: "Estimated investment amount",
              example: 500000.00,
            },
            notes: {
              type: "string",
              nullable: true,
              description: "Additional notes about the user",
              example: "VIP client, prefers email communication",
            },
            companyName: {
              type: "string",
              maxLength: 255,
              nullable: true,
              description: "Company name",
              example: "ABC Construction Ltd",
            },
            supervisorId: {
              type: "string",
              format: "uuid",
              nullable: true,
              description: "Assigned supervisor's user ID",
              example: "d1f8ac24-57c1-47aa-ae6a-092de6e55553",
            },
            timezone: {
              type: "string",
              maxLength: 100,
              nullable: true,
              default: "UTC",
              description: "User timezone preference",
              example: "Asia/Kolkata",
            },
            currency: {
              type: "string",
              maxLength: 20,
              nullable: true,
              default: "USD",
              description: "User currency preference",
              example: "INR",
            },
            language: {
              type: "string",
              maxLength: 50,
              nullable: true,
              default: "English",
              description: "User language preference",
              example: "English",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Auto-generated creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Auto-generated update timestamp",
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
              format: "uuid",
              description: "Auto-generated project ID",
            },
            projectName: {
              type: "string",
              maxLength: 255,
              example: "Smart Home Project",
            },
            description: {
              type: "string",
              maxLength: 255,
              example: "A smart home automation project",
            },
            projectType: {
              type: "string",
              enum: ["villa", "apartment", "building"],
              example: "villa",
            },
            location: {
              type: "string",
              maxLength: 255,
              example: "123 Main St, City",
            },
            progress: {
              type: "integer",
              example: 0,
            },
            status: {
              type: "string",
              enum: ["planning", "in_progress", "completed", "on_hold"],
              example: "planning",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "Associated user ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["userName", "role", "email", "contact"],
          properties: {
            userName: {
              type: "string",
              maxLength: 255,
              example: "John Doe",
            },
            role: {
              type: "string",
              enum: ["admin", "user", "supervisor"],
              example: "user",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              maxLength: 255,
              description: "Password (will be hashed automatically)",
              example: "SecurePassword123!",
            },
            contact: {
              type: "string",
              maxLength: 15,
              example: "9876543210",
            },
            estimatedInvestment: {
              type: "number",
              format: "decimal",
              description: "Estimated investment amount (optional)",
              example: 500000.00,
            },
            notes: {
              type: "string",
              description: "Additional notes about the user (optional)",
              example: "VIP client, prefers email communication",
            },
            companyName: {
              type: "string",
              maxLength: 255,
              description: "Company name (optional)",
              example: "ABC Construction Ltd",
            },
            supervisorId: {
              type: "string",
              format: "uuid",
              description: "Assigned supervisor's user ID (optional)",
              example: "d1f8ac24-57c1-47aa-ae6a-092de6e55553",
            },
            timezone: {
              type: "string",
              maxLength: 100,
              description: "User timezone preference (optional, defaults to UTC)",
              example: "Asia/Kolkata",
            },
            currency: {
              type: "string",
              maxLength: 20,
              description: "User currency preference (optional, defaults to USD)",
              example: "INR",
            },
            language: {
              type: "string",
              maxLength: 50,
              description: "User language preference (optional, defaults to English)",
              example: "English",
            },
          },
        },
        CreateProjectRequest: {
          type: "object",
          required: ["projectName", "description", "projectType", "location", "progress", "status", "userId"],
          properties: {
            projectName: {
              type: "string",
              maxLength: 255,
              example: "Smart Home Project",
            },
            description: {
              type: "string",
              maxLength: 255,
              example: "A smart home automation project",
            },
            projectType: {
              type: "string",
              enum: ["villa", "apartment", "building"],
              example: "villa",
            },
            location: {
              type: "string",
              maxLength: 255,
              example: "123 Main St, City",
            },
            progress: {
              type: "integer",
              example: 0,
            },
            status: {
              type: "string",
              enum: ["planning", "in_progress", "completed", "on_hold"],
              example: "planning",
            },
            userId: {
              type: "string",
              format: "uuid",
              example: "d1f8ac24-57c1-47aa-ae6a-092de6e55553",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message here",
            },
          },
        },
      },
    },
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.routes.js", "./src/modules/**/*.controller.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


