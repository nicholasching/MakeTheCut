# Backend Test Bench

A simple web interface to test your backend API routes.

## The Problem We Solved

**CSRF Token Error:** When testing Auth.js routes, you may encounter:
```
[auth][error] MissingCSRF: CSRF token was missing during an action signin
```

This happens because:
1. **Cookies don't work with `file://` protocol** - If you open `index.html` directly, browsers won't send cookies due to `SameSite=Lax` restrictions
2. **CSRF tokens are stored in cookies** - Auth.js requires CSRF tokens to be sent via cookies for security

## Solution

We've implemented two fixes:

### 1. **Cookie Configuration** (Backend)
- Configured Auth.js cookies to use `SameSite=None` and `Secure=false` in development
- This allows cookies to work with cross-origin requests (including from the test server)

### 2. **Test Server** (Recommended)
- Created a simple HTTP server to serve the test bench
- This ensures cookies work properly since you're accessing via `http://` instead of `file://`

## How to Use

### Option 1: Use the Test Server (Recommended)

1. **Start the test server:**
   ```bash
   cd backendTest
   node server.js
   ```

2. **Open in browser:**
   ```
   http://localhost:8080
   ```

3. **Make sure your backend is running:**
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Open HTML Directly (Not Recommended)

You can still open `index.html` directly, but:
- ⚠️ Cookies won't work properly
- ⚠️ CSRF-protected routes will fail
- ⚠️ You'll see a warning banner

## Features

- ✅ Test all backend routes
- ✅ View request/response details
- ✅ Test Auth.js OAuth flows
- ✅ Test CSRF-protected endpoints
- ✅ Custom route testing

## Available Routes

### Public Routes
- `GET /` - Root endpoint
- `GET /user` - User info endpoint

### Auth Routes
- `GET /auth/signin/google` - Initiate Google OAuth
- `GET /auth/csrf` - Get CSRF token
- `POST /auth/signin` - Sign in (requires CSRF token)
- `POST /auth/signout` - Sign out (requires CSRF token)
- `GET /auth/session` - Get current session
- `GET /auth/callback/google` - OAuth callback (called by Google)

### Protected Routes
- `GET /mtc` - Protected endpoint (requires authentication)
- `GET /mtc/test` - Protected test endpoint

## Troubleshooting

### Still getting CSRF errors?

1. **Make sure you're using the test server** (`node server.js`)
2. **Check that your backend has `NODE_ENV=dev`** set
3. **Clear your browser cookies** and try again
4. **Check browser console** for cookie-related warnings

### Cookies not being sent?

- Ensure you're accessing via `http://localhost:8080` (not `file://`)
- Check that CORS is configured correctly in your backend
- Verify `credentials: 'include'` is set in fetch requests (already done in the test bench)

## Technical Details

### Cookie Configuration

In development mode, Auth.js cookies are configured with:
- `SameSite: 'none'` - Allows cross-origin cookie sending
- `Secure: false` - Allows cookies over HTTP (dev only)
- `HttpOnly: true` - Prevents JavaScript access (security)

### CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (backend itself)
- `http://localhost:8080` (test bench server)
- `file://` origins (with limitations)
