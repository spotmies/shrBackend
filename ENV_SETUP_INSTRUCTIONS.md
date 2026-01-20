# Environment Variables Setup

## Issue: JWT_SECRET is not defined

If you're getting the error `"JWT_SECRET is not defined in environment variables"`, follow these steps:

## Step 1: Locate your .env file

Your `.env` file should be located at: `SHR/src/config/.env`

## Step 2: Add Required Variables

Make sure your `.env` file contains **ALL** of the following variables:

```env
# Server Configuration
PORT=3000

# Admin Credentials (REQUIRED)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123

# JWT Configuration (REQUIRED - This is what's missing!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_please_use_random_string
JWT_EXPIRY=24h

# Database Configuration (if you have it)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

## Step 3: Generate a Secure JWT_SECRET

**Important:** `JWT_SECRET` must be:
- At least 32 characters long
- A random, secure string
- Never shared or committed to version control

### Quick way to generate a secure JWT_SECRET:

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Online generator**
Visit: https://randomkeygen.com/ and use a "CodeIgniter Encryption Keys" (256-bit)

## Step 4: Example .env file

Here's a complete example:

```env
PORT=3000

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123

# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRY=24h

# Database (your existing config)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=your_database
```

## Step 5: Restart Your Server

After adding `JWT_SECRET` to your `.env` file:

1. **Stop your server** (Ctrl+C)
2. **Start it again** (`npm run dev` or your start command)

## Step 6: Test Again

Try the login endpoint again:

**POST** `http://localhost:3000/api/auth/admin/login`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

## Troubleshooting

### Still getting the error?

1. **Check file location**: Make sure `.env` is at `SHR/src/config/.env`
2. **Check for typos**: Variable name must be exactly `JWT_SECRET` (case-sensitive)
3. **No spaces**: Make sure there are no spaces around the `=` sign
4. **No quotes needed**: Don't wrap values in quotes unless they contain spaces
5. **Restart server**: Always restart after changing `.env`

### Verify your .env is being loaded

Add this temporarily to your `server.ts` to check:

```typescript
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Found" : "✗ Missing");
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "✓ Found" : "✗ Missing");
```

## Security Reminders

- ✅ Never commit `.env` file to Git
- ✅ Use different `JWT_SECRET` for production
- ✅ Use strong, random `JWT_SECRET` (minimum 32 characters)
- ✅ Keep `ADMIN_PASSWORD` secure






