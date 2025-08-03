import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from '../services/authService';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware for protected routes
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : req.cookies?.auth_token;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    
    // Log user activity for death switch monitoring
    await AuthService.logUserActivity(decoded.id);
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error);
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Your session has expired. Please log in again.'
    });
  }
};

/**
 * API key authentication middleware for external integrations
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required',
        message: 'Please provide a valid API key'
      });
    }

    const keyData = AuthService.verifyApiKey(apiKey);
    if (!keyData) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is invalid or expired'
      });
    }

    req.user = { id: keyData.userId, apiKey: true };
    next();
  } catch (error) {
    console.error('[Auth Middleware] API key verification failed:', error);
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires ${requiredRole} role`
      });
    }

    next();
  };
};

/**
 * Subscription-based authorization middleware
 */
export const requireSubscription = (requiredPlan: string[] = ['basic', 'premium', 'family']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check user's subscription status
      // This would integrate with PaymentService
      const hasValidSubscription = true; // Placeholder
      
      if (!hasValidSubscription) {
        return res.status(403).json({ 
          error: 'Subscription required',
          message: 'This feature requires an active subscription',
          requiredPlans: requiredPlan
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware] Subscription check failed:', error);
      return res.status(500).json({ error: 'Failed to verify subscription' });
    }
  };
};

/**
 * Rate limiting middleware (simple implementation)
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();
    
    const userRequests = requests.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    userRequests.count++;
    next();
  };
};

/**
 * Request logging middleware
 */
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || 'anonymous';
    
    console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - User: ${userId}`);
    
    // Log to database for audit trail (would implement with database)
    if (req.path.startsWith('/api/')) {
      // Save to audit log
    }
  });
  
  next();
};

/**
 * Error handling middleware
 */
export const handleErrors = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    user: req.user?.id || 'anonymous'
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    stack: error.stack
  });
};

/**
 * CORS middleware with dynamic origins
 */
export const configureCORS = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://www.nexteraestate.com',
    'https://nexteraestate.com',
    'https://app.nexteraestate.com'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
  
  next();
};

export default {
  authenticateUser,
  authenticateApiKey,
  requireRole,
  requireSubscription,
  rateLimit,
  logRequest,
  handleErrors,
  configureCORS,
  securityHeaders
};