import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SecurityValidator, SecurityLogger } from './security-simple';

// JWT token management
export class TokenManager {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

  static generateAccessToken(payload: { userId: string; email: string; role: string; name?: string }): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, this.JWT_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

// Password hashing
export class PasswordManager {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateSecurePassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

// Session management
export class SessionManager {
  private static sessions = new Map<string, {
    userId: string;
    email: string;
    role: string;
    name?: string;
    createdAt: Date;
    lastAccessed: Date;
    ipAddress: string;
    userAgent: string;
  }>();

  static createSession(sessionData: {
    userId: string;
    email: string;
    role: string;
    name?: string;
    ipAddress: string;
    userAgent: string;
  }): string {
    const sessionId = this.generateSessionId();
    
    this.sessions.set(sessionId, {
      ...sessionData,
      createdAt: new Date(),
      lastAccessed: new Date()
    });
    
    return sessionId;
  }

  static getSession(sessionId: string): any | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Update last accessed time
    session.lastAccessed = new Date();
    
    return session;
  }

  static destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  static destroyUserSessions(userId: string): number {
    let count = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    
    return count;
  }

  static cleanupExpiredSessions(): number {
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    let count = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastAccessed.getTime() > maxAge) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    
    return count;
  }

  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Authentication service
export class AuthService {
  // User registration
  static async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'buyer' | 'seller';
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Validate input
      const emailValidation = SecurityValidator.validateEmail(userData.email);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }

      const passwordValidation = SecurityValidator.validatePassword(userData.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
      }

      const nameValidation = SecurityValidator.validateName(userData.name);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.error };
      }

      let phoneValidation = { valid: true };
      if (userData.phone) {
        phoneValidation = SecurityValidator.validatePhone(userData.phone);
        if (!phoneValidation.valid) {
          return { success: false, error: phoneValidation.error };
        }
      }

      // Check if user already exists (this would typically query the database)
      // For now, we'll simulate this check
      console.log('Checking if user exists:', emailValidation.sanitized);

      // Hash password
      const hashedPassword = await PasswordManager.hashPassword(userData.password);

      // Create user (this would typically insert into database)
      const user = {
        id: this.generateUUID(),
        email: emailValidation.sanitized,
        name: nameValidation.sanitized,
        phone: phoneValidation.valid ? phoneValidation.sanitized : null,
        role: userData.role,
        passwordHash: hashedPassword,
        kycStatus: 'pending',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      console.log('User created successfully:', user.email);

      return { success: true, user };

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // User login
  static async login(credentials: {
    email: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ success: boolean; tokens?: { accessToken: string; refreshToken: string }; user?: any; error?: string }> {
    try {
      // Validate input
      const emailValidation = SecurityValidator.validateEmail(credentials.email);
      if (!emailValidation.valid) {
        SecurityLogger.logSecurityEvent({
          type: 'auth_failure',
          ip: credentials.ipAddress,
          userAgent: credentials.userAgent,
          details: { reason: 'invalid_email', email: credentials.email }
        });
        return { success: false, error: 'Invalid email format' };
      }

      // Get user from database (this would typically query the database)
      // For now, we'll simulate this
      const user = await this.getUserByEmail(emailValidation.sanitized);
      
      if (!user) {
        SecurityLogger.logSecurityEvent({
          type: 'auth_failure',
          ip: credentials.ipAddress,
          userAgent: credentials.userAgent,
          details: { reason: 'user_not_found', email: emailValidation.sanitized }
        });
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.isActive) {
        SecurityLogger.logSecurityEvent({
          type: 'auth_failure',
          userId: user.id,
          ip: credentials.ipAddress,
          userAgent: credentials.userAgent,
          details: { reason: 'user_inactive' }
        });
        return { success: false, error: 'Account is inactive' };
      }

      // Verify password
      const passwordValid = await PasswordManager.comparePassword(credentials.password, user.passwordHash);
      
      if (!passwordValid) {
        SecurityLogger.logSecurityEvent({
          type: 'auth_failure',
          userId: user.id,
          ip: credentials.ipAddress,
          userAgent: credentials.userAgent,
          details: { reason: 'invalid_password' }
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate tokens
      const accessToken = TokenManager.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      const refreshToken = TokenManager.generateRefreshToken(user.id);

      // Create session
      SessionManager.createSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent
      });

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user;

      console.log('User logged in successfully:', user.email);

      return {
        success: true,
        tokens: { accessToken, refreshToken },
        user: userWithoutPassword
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ success: boolean; accessToken?: string; error?: string }> {
    try {
      const decoded = TokenManager.verifyRefreshToken(refreshToken);
      
      // Get user from database
      const user = await this.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Generate new access token
      const accessToken = TokenManager.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      return { success: true, accessToken };

    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  // Logout
  static async logout(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const decoded = TokenManager.verifyAccessToken(accessToken);
      
      // Destroy user sessions
      SessionManager.destroyUserSessions(decoded.userId);

      console.log('User logged out:', decoded.email);

      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      const passwordValidation = SecurityValidator.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
      }

      // Get user from database
      const user = await this.getUserById(userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const currentPasswordValid = await PasswordManager.comparePassword(currentPassword, user.passwordHash);
      
      if (!currentPasswordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await PasswordManager.hashPassword(newPassword);

      // Update password in database
      console.log('Password updated for user:', user.email);

      // Destroy all user sessions (force re-login)
      SessionManager.destroyUserSessions(userId);

      return { success: true };

    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }

  // Helper methods (these would typically interact with a database)
  private static async getUserByEmail(email: string): Promise<any> {
    // This would typically query the database
    // For now, we'll return a mock user for demo purposes
    if (email === 'buyer@quickbid.com') {
      return {
        id: 'buyer-123',
        email: 'buyer@quickbid.com',
        name: 'Demo Buyer',
        role: 'buyer',
        passwordHash: await PasswordManager.hashPassword('QuickBid2026!'),
        kycStatus: 'verified',
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }
    
    if (email === 'seller@quickbid.com') {
      return {
        id: 'seller-123',
        email: 'seller@quickbid.com',
        name: 'Demo Seller',
        role: 'seller',
        passwordHash: await PasswordManager.hashPassword('QuickBid2026!'),
        kycStatus: 'verified',
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }
    
    if (email === 'founder@quickbid.com') {
      return {
        id: 'admin-123',
        email: 'founder@quickbid.com',
        name: 'Demo Admin',
        role: 'admin',
        passwordHash: await PasswordManager.hashPassword('QuickBid2026!'),
        kycStatus: 'verified',
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }
    
    return null;
  }

  private static async getUserById(userId: string): Promise<any> {
    // This would typically query the database
    const users = {
      'buyer-123': { id: 'buyer-123', email: 'buyer@quickbid.com', name: 'Demo Buyer', role: 'buyer', kycStatus: 'verified', isActive: true },
      'seller-123': { id: 'seller-123', email: 'seller@quickbid.com', name: 'Demo Seller', role: 'seller', kycStatus: 'verified', isActive: true },
      'admin-123': { id: 'admin-123', email: 'founder@quickbid.com', name: 'Demo Admin', role: 'admin', kycStatus: 'verified', isActive: true }
    };
    
    return users[userId as keyof typeof users] || null;
  }

  private static generateUUID(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : Array.isArray(authHeader) ? authHeader[0]?.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = TokenManager.verifyAccessToken(token);
    
    // Check if session exists
    const session = SessionManager.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      SecurityLogger.logSecurityEvent({
        type: 'auth_failure',
        userId: req.user.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'],
        details: { reason: 'insufficient_permissions', requiredRole: roles, userRole: req.user.role }
      });
      
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Cleanup expired sessions periodically
setInterval(() => {
  const cleaned = SessionManager.cleanupExpiredSessions();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired sessions`);
  }
}, 60 * 60 * 1000); // Every hour
