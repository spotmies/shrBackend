# Admin Authentication System

This module implements admin authentication using JWT tokens with credentials stored in `.env` file.

## Features

- ✅ Single admin (no database table required)
- ✅ Credentials stored in `.env` file
- ✅ JWT token generation with role-based access
- ✅ Token expiry support
- ✅ Admin middleware for route protection
- ✅ Proper error handling for unauthorized access

## Setup

### 1. Environment Variables

Add the following to your `.env` file (located at `src/config/.env`):

```env
# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRY=24h
```

**Important:** 
- Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your desired credentials
- Use a strong, random string for `JWT_SECRET` (minimum 32 characters)
- `JWT_EXPIRY` can be: `1h`, `24h`, `7d`, etc.

### 2. Login Endpoint

**POST** `/api/auth/admin/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_secure_password_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@example.com",
  "role": "admin"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Protecting Routes

To protect a route with admin authentication, use the `adminAuthMiddleware`:

### Example 1: Protect a single route

```typescript
const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../../middleware/adminAuth.middleware.ts");
const YourController = require("./your.controller.ts");

// Protected route
router.post("/protected-route", adminAuthMiddleware, YourController.yourMethod);

module.exports = router;
```

### Example 2: Protect multiple routes

```typescript
const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../../middleware/adminAuth.middleware.ts");
const YourController = require("./your.controller.ts");

// All routes below are protected
router.use(adminAuthMiddleware);

router.post("/create", YourController.create);
router.put("/update/:id", YourController.update);
router.delete("/delete/:id", YourController.delete);

module.exports = router;
```

### Example 3: Protect specific routes only

```typescript
const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../../middleware/adminAuth.middleware.ts");
const YourController = require("./your.controller.ts");

// Public route
router.get("/public", YourController.getPublic);

// Protected routes
router.post("/admin-only", adminAuthMiddleware, YourController.adminMethod);
router.put("/admin-update/:id", adminAuthMiddleware, YourController.adminUpdate);

module.exports = router;
```

## Using the Token

After successful login, include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Example with Postman:

1. Set header: `Authorization`
2. Set value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Example with cURL:

```bash
curl -X GET http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Responses

### Missing Token (401):
```json
{
  "success": false,
  "message": "Authorization token is required. Please provide a valid Bearer token."
}
```

### Invalid/Expired Token (401):
```json
{
  "success": false,
  "message": "Invalid or expired token. Please login again."
}
```

### Insufficient Privileges (403):
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

## Accessing User Info in Protected Routes

In your controller, you can access the authenticated admin's information:

```typescript
exports.yourProtectedMethod = async (req: any, res: Response) => {
    // Access authenticated admin info
    const adminEmail = req.user.email;  // "admin@example.com"
    const adminRole = req.user.role;    // "admin"
    
    // Your logic here
};
```

## Security Notes

1. **Never commit `.env` file** to version control
2. Use strong passwords for `ADMIN_PASSWORD`
3. Use a long, random string for `JWT_SECRET` (minimum 32 characters)
4. Set appropriate `JWT_EXPIRY` based on your security requirements
5. Always use HTTPS in production
6. Consider implementing rate limiting for login endpoint

