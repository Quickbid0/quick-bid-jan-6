# Phase 1 Backend Integration - httpOnly Cookie Implementation

**Status:** In Progress  
**Build:** ✅ Passing (10.11s)  
**Completed:** Middleware imports + rates limit update to 5/10s  
**Next:** Implement httpOnly cookies in auth endpoints

---

## Overview

The backend needs to transition from JWT in `localStorage` (XSS vulnerable) to JWT in `httpOnly` cookies (secure).

### Current Auth Flow Issues ⚠️
- JWT returned in JSON body (vulnerable to XSS)
- Frontend stores in localStorage (attacker can access via JS)
- Client-side role checks (can be bypassed)
- No automatic token refresh on 401

### New Auth Flow ✅
- JWT set in httpOnly cookie (secure)
- localStorage only stores non-sensitive data
- Server-side role verification (cannot bypass)
- Frontend auto-refreshes token on 401 via interceptor

---

## Implementation Steps

### Step 1: Identify Current Auth Endpoints

The project has auth implemented in **two places**:

1. **Express routes** (backend/) - for REST API
2. **NestJS modules** (backend/src/) - for main application

### Step 2: Express Auth Routes (If Exists)

**Check for existing auth endpoints:**
```bash
grep -r "POST.*login\|POST.*auth" backend/routes backend/controllers | head -20
```

If you find a `loginHandler` in a controller, update it to set httpOnly cookies.

### Step 3: NestJS Auth Controller Update

**File:** `/backend/src/auth/auth.controller.ts`

Add the httpOnly cookie logic to the login endpoint:

```typescript
import { Controller, Post, Body, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ FIX S-02: Set JWT as httpOnly cookie instead of returning in body
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      // Validate credentials
      const result = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!result) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.authService.generateTokens(result);

      // ✅ Set access token in httpOnly cookie (15 min expiry)
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      // ✅ Set refresh token in httpOnly cookie (7 day expiry)
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      // ⚠️ DO NOT send token in response body (defeats purpose of httpOnly)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
        },
        // tokens are in cookies, NOT in body
      });
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  // ✅ FIX S-03: Token refresh endpoint with httpOnly cookies
  @Post('refresh')
  async refresh(@Res() res: Response) {
    try {
      // Frontend sends refresh_token cookie automatically (browser does this)
      // We don't need to receive it explicitly, but if needed from request:
      // const refreshToken = req.cookies.refresh_token;

      // In NestJS, access request via @Req() if needed
      // But typically Express middleware handles cookies automatically

      // Generate new access token
      const decoded = await this.authService.verifyRefreshToken(
        res.req.cookies?.refresh_token
      );

      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      // Get fresh user data
      const user = await this.authService.getUserById(decoded.userId);

      // Generate new access token
      const { accessToken } = await this.authService.generateTokens(user);

      // ✅ Set new access token cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

      res.status(200).json({ success: true, message: 'Token refreshed' });
    } catch (error) {
      // ✅ FIX S-04: Return 401 on refresh failure (frontend will logout)
      res.status(401).json({ error: 'Token refresh failed' });
    }
  }

  // ✅ FIX: Clear httpOnly cookies on logout
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.status(200).json({ success: true, message: 'Logged out' });
  }

  // ✅ Return current user profile (already protected by @UseGuards(JwtAuthGuard))
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
```

### Step 4: JWT Strategy Update

**File:** `/backend/src/auth/jwt.strategy.ts`

Ensure the JWT strategy reads from cookies:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // ✅ FIX S-02: Extract JWT from httpOnly cookie first, fallback to header
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Try httpOnly cookie first
        (req: Request) => {
          if (req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
          }
          return null;
        },
        // 2. Fallback to Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // ✅ FIX S-01: Never accept role from request body - ONLY from JWT
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role, // From JWT only
    };
  }
}
```

### Step 5: Express Middleware for Cookie Parsing

**File:** `/backend/server.ts` or main Express setup

Ensure `cookie-parser` is loaded:

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

// ✅ Must be BEFORE routes to parse cookies
app.use(express.json());
app.use(cookieParser()); // Parse httpOnly cookies
app.use(cors({ credentials: true })); // Allow cookies in CORS

// Then routes...
app.use('/api/auth', authRoutes);
```

Package.json must have `cookie-parser`:
```bash
npm install cookie-parser
# or
yarn add cookie-parser
```

### Step 6: Frontend Axios Interceptor (Already Done ✅)

This is already implemented in `/src/utils/axiosInterceptor.ts` and should:

1. **Request interceptor:** Attach cookies automatically (browser does this)
2. **Response interceptor:**
   - If 401: Call `POST /api/auth/refresh` with `withCredentials: true`
   - Retry original request
   - If refresh fails: Redirect to login

The key is `withCredentials: true` to send cookies:

```typescript
// This is already in axiosInterceptor.ts
await axios.post('/api/auth/refresh', {}, { withCredentials: true })
```

---

## Testing httpOnly Cookies

### Test 1: Login and Check Cookies

```bash
# 1. Start backend (if not already running)
cd backend
npm run dev

# 2. In another terminal, test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v  # Show headers

# ✅ Expected: Cookie headers in response
# Set-Cookie: access_token=eyJhb...;HttpOnly;Secure;SameSite=Strict
# Set-Cookie: refresh_token=eyJhb...;HttpOnly;Secure;SameSite=Strict
```

### Test 2: Verify Token in Cookie

```bash
# Save cookies from login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt  # Save to file

# Use cookies for authenticated request
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt  # Read from file

# ✅ Expected: 200 OK with user data
# ❌ Without cookies: 401 Unauthorized
```

### Test 3: Token Refresh

```bash
# 1. Login and save cookies
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# 2. Wait 15 minutes (or manually expire token in DB)

# 3. Try to use expired token
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt  # Has expired access_token

# 4. Frontend should get 401 and call refresh
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt  # Has valid refresh_token
  -c cookies.txt  # Save new access_token

# ✅ Expected: New access_token cookie set, refresh succeeds
```

### Test 4: Frontend Integration Test

```bash
# In browser DevTools Console:

// 1. Check localStorage (should NOT have token)
localStorage.getItem('auth_token')  // Should be null
localStorage.getItem('id_token')    // Should be null

// 2. Check cookies
document.cookie  // Should NOT show token (httpOnly means JS can't access)

// 3. In DevTools Application tab > Cookies
// Should see: access_token (HttpOnly, Secure, SameSite)
```

---

## Common Issues & Fixes

### Issue 1: "Cannot set cookie - CORS not allowing credentials"

**Cause:** `credentials: true` not set in CORS config

**Fix:**
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true  // ✅ REQUIRED for cookies
}));
```

### Issue 2: "Token cookie not being sent to backend"

**Cause:** Frontend not sending cookies with requests

**Fix:** Ensure `withCredentials: true` in axios:
```typescript
axios.create({
  withCredentials: true  // ✅ Include cookies
})
```

### Issue 3: Development localhost not working

**Cause:** `secure: true` requires HTTPS

**Fix:**
```typescript
res.cookie('token', value, {
  secure: process.env.NODE_ENV === 'production',  // ✅ Only HTTPS in production
  // localStorage works on HTTP in development
})
```

### Issue 4: "Cannot read refresh token in refresh endpoint"

**Cause:** Cookies not being parsed

**Fix:** Ensure `cookie-parser()` middleware is loaded BEFORE routes

---

## Checklist for httpOnly Cookie Implementation

- [ ] Add `cookie-parser` to backend dependencies
- [ ] Update `/backend/src/auth/auth.controller.ts` with cookie logic
- [ ] Update `/backend/src/auth/jwt.strategy.ts` to read from cookies
- [ ] Ensure `app.use(cookieParser())` in Express setup
- [ ] Ensure CORS has `credentials: true`
- [ ] Test login sets cookies
- [ ] Test authenticated requests use cookies
- [ ] Test token refresh works
- [ ] Test logout clears cookies
- [ ] Verify localStorage does NOT have token
- [ ] Frontend builds successfully
- [ ] Test in browser: DevTools Application tab shows cookies

---

## Integration Timeline

| Step | Time | Status |
|------|------|--------|
| Update auth controller | 30 min | 🚀 Ready |
| Update JWT strategy | 15 min | 🚀 Ready |
| Test httpOnly cookies | 20 min | 🚀 Ready |
| Verify frontend works | 15 min | 🚀 Ready |
| **Total Phase 1** | **~80 min** | ✅ On track |

---

## Next Steps After httpOnly Cookies

1. ✅ **S-02/S-03/S-04 Complete:** httpOnly cookies working
2. ⏳ **S-05:** Add PII sanitization to auction endpoints
3. ⏳ **RT-01:** Integrate AtomicBidService for atomic bids
4. ⏳ **Verify build:** `npm run build` still passes

---

## Files Modified So Far

- ✅ `/backend/server.ts` — Imported verifyRole, bidRateLimiter, added /api/auth/refresh
- ✅ `/backend/sockets/auctionSocket.ts` — Updated rate limit to 5/10s
- 🔄 `/backend/src/auth/auth.controller.ts` — Ready for httpOnly cookie implementation
- 🔄 `/backend/src/auth/jwt.strategy.ts` — Ready for cookie extraction

---

## Reference: Complete Diff for auth.controller.ts

If you want to copy-paste the entire updated auth controller, refer to the section "Step 3" above. Key changes:

- Login: Set `access_token` and `refresh_token` cookies
- Refresh: Validate `refresh_token`, set new `access_token`
- Logout: Clear both cookies
- Return user info (NOT token) in response body

