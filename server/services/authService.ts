import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

// Google OAuth setup
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider: string;
  authProviderId: string;
  createdAt: Date;
  lastActive: Date;
}

export class AuthService {
  
  /**
   * Generate Google OAuth URL
   */
  static getGoogleAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    });
  }

  /**
   * Verify Google OAuth code and get user info
   */
  static async verifyGoogleAuth(code: string): Promise<{
    email: string;
    name: string;
    avatar: string;
    googleId: string;
  }> {
    try {
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      return {
        email: payload.email!,
        name: payload.name!,
        avatar: payload.picture || '',
        googleId: payload.sub
      };
    } catch (error) {
      console.error('[Auth] Google verification failed:', error);
      throw new Error('Google authentication failed');
    }
  }

  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate secure session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash password (for future email/password auth)
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Create user session data
   */
  static createUserSession(user: User): {
    user: Omit<User, 'authProviderId'>;
    token: string;
  } {
    const { authProviderId, ...safeUser } = user;
    
    return {
      user: safeUser,
      token: this.generateToken(user)
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate password reset token
   */
  static generateResetToken(): {
    token: string;
    hash: string;
    expires: Date;
  } {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    return { token, hash, expires };
  }

  /**
   * Verify reset token
   */
  static verifyResetToken(token: string, hash: string): boolean {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return tokenHash === hash;
  }

  /**
   * Check if user is authenticated
   */
  static authenticateRequest(req: any): User | null {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : req.cookies?.auth_token;

      if (!token) {
        return null;
      }

      const decoded = this.verifyToken(token);
      return decoded as User;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create secure cookie options
   */
  static getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    };
  }

  /**
   * Log user activity for death switch monitoring
   */
  static async logUserActivity(userId: string): Promise<void> {
    try {
      // Update user's last active timestamp
      // This would be implemented with your database layer
      console.log(`[Auth] User activity logged: ${userId}`);
      
      // TODO: Update database with last active time
      // await db.update(users).set({ lastActive: new Date() }).where(eq(users.id, userId));
    } catch (error) {
      console.error('[Auth] Failed to log user activity:', error);
    }
  }

  /**
   * Generate API key for external integrations
   */
  static generateApiKey(userId: string): string {
    const timestamp = Date.now().toString();
    const data = `${userId}-${timestamp}`;
    const hash = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    
    return `nee_${Buffer.from(data).toString('base64')}_${hash.substring(0, 16)}`;
  }

  /**
   * Verify API key
   */
  static verifyApiKey(apiKey: string): { userId: string; timestamp: number } | null {
    try {
      if (!apiKey.startsWith('nee_')) {
        return null;
      }

      const [, encodedData, providedHash] = apiKey.split('_');
      const data = Buffer.from(encodedData, 'base64').toString();
      const [userId, timestampStr] = data.split('-');
      
      // Verify hash
      const expectedHash = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
      if (expectedHash.substring(0, 16) !== providedHash) {
        return null;
      }

      const timestamp = parseInt(timestampStr);
      
      // Check if key is not too old (30 days)
      if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
        return null;
      }

      return { userId, timestamp };
    } catch (error) {
      return null;
    }
  }
}

export default AuthService;