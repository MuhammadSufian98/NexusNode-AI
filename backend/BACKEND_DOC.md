# NexusNode AI Backend API

## Base URL

- Development: `http://localhost:5000`

## Auth Domain Endpoints

### 1) POST /api/auth/verify-email

Generates and emails a 6-digit OTP to verify ownership of an email address.

Request body:

```json
{
  "email": "user@example.com"
}
```

Success response (`200`):

```json
{
  "message": "Verification code sent to email",
  "expires_in_seconds": 300
}
```

Error response (`400`):

```json
{
  "message": "Valid email is required"
}
```

### 2) POST /api/auth/register

Registers a new user after validating OTP from `TempCode` collection.

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "full_name": "User Name",
  "code": "123456"
}
```

Success response (`201`):

```json
{
  "message": "Registration successful",
  "user": {
    "id": "67ee8a4d1b27f8326d8f0abc",
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```

Error response (`400`):

```json
{
  "message": "Invalid or expired OTP code"
}
```

### 3) POST /api/auth/login

Authenticates user credentials and sets JWT in HttpOnly cookie.

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

Success response (`200`):

```json
{
  "message": "Login successful",
  "user": {
    "id": "67ee8a4d1b27f8326d8f0abc",
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```

Cookie set on success:

- Name: `token`
- Options: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`

Error response (`401`):

```json
{
  "message": "Invalid credentials"
}
```

### 4) GET /api/profile/me

Protected endpoint that validates token cookie and returns session user.

Request:

- Requires cookie: `token`

Success response (`200`):

```json
{
  "id": "67ee8a4d1b27f8326d8f0abc",
  "email": "user@example.com",
  "full_name": "User Name",
  "isVerified": true,
  "avatar": "data:image/png;base64,...",
  "avatarUrl": "data:image/png;base64,...",
  "clearance": "Lvl 4",
  "nodesCount": 0
}
```

Error response (`401`):

```json
{
  "message": "Unauthorized"
}
```

### 5) PATCH /api/profile

Protected endpoint for updating profile identity fields.

Request:

- Requires cookie: `token`

Request body:

```json
{
  "full_name": "Updated Name",
  "email": "updated@example.com"
}
```

Behavior notes:

- `full_name` is optional, but must be 2-120 characters when provided.
- `email` is optional, but must be valid when provided.
- If email changes, backend sets `isVerified` to `false` and automatically sends a fresh OTP to the new address.

Success response (`200`):

```json
{
  "message": "Profile updated. Verification code sent to new email",
  "emailVerificationRequired": true,
  "user": {
    "id": "67ee8a4d1b27f8326d8f0abc",
    "email": "updated@example.com",
    "full_name": "Updated Name",
    "isVerified": false,
    "avatar": "data:image/png;base64,...",
    "clearance": "Lvl 4",
    "nodesCount": 0
  }
}
```

Error response (`409`):

```json
{
  "message": "Email already in use"
}
```

### 6) POST /api/profile/avatar

Protected endpoint to upload and set a user avatar.

Request:

- Requires cookie: `token`
- Content-Type: `multipart/form-data`
- Form field: `avatar` (file)

Storage behavior:

- The file is read into memory and stored in MongoDB Atlas as Base64 data.
- The `User.avatar` field now contains:

```json
{
  "data": "<base64-string>",
  "contentType": "image/png"
}
```

Success response (`200`):

```json
{
  "message": "Avatar uploaded successfully",
  "user": {
    "id": "67ee8a4d1b27f8326d8f0abc",
    "email": "user@example.com",
    "full_name": "User Name",
    "isVerified": true,
    "avatar": "data:image/png;base64,...",
    "clearance": "Lvl 4",
    "nodesCount": 0
  }
}
```

Error response (`400`):

```json
{
  "message": "Avatar file is required"
}
```

## Security Protocol

- HttpOnly cookie for JWT:
  Prevents direct JavaScript access to auth tokens in the browser, reducing XSS token theft risk.
- Bcrypt password hashing:
  Passwords are never stored in plaintext; `bcrypt` produces one-way hashes resistant to rainbow table attacks.
- Sensitive field protection:
  `pwd_hash` is never returned in API responses.
- Avatar field shape:
  Avatar data is stored in MongoDB Atlas and returned to clients as a data URL string.
- Profile clients can reuse the authenticated session state and only call `/api/profile/me` when hydration or refresh is required.

## Environment Variables

Use `.env` template values and replace for production:

```env
APP_ENV=development
PORT=<backend_port>
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
GMAIL_USER=<your_email_account>
GMAIL_PASS=<your_email_app_password>
FRONTEND_URL=<your_frontend_origin>
GEMINI_API_KEY=<your_gemini_api_key>
```

Runtime mode:

- `APP_ENV=development` -> uses `nodemon` runner when using `npm run dev`.
- `APP_ENV=production` -> uses plain `node` runner (safe for Render production runtime).

## Privacy Guardian Check

For every new auth-protected backend endpoint, apply this check:

- Does this endpoint handle sensitive data that must pass through Privacy Guardian redaction middleware before indexing/vectorization?
