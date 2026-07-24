import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { isTokenRevoked } from '../services/authService';

interface JwtPayload {
  sub: string;
  role: 'manager' | 'secretary' | 'instructor';
  staffId: string | null;
  jti: string;
  exp: number;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Missing or malformed Authorization header.');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (await isTokenRevoked(payload.jti)) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Token has been revoked.');
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      staffId: payload.staffId,
      jti: payload.jti,
      exp: payload.exp,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'UNAUTHENTICATED', 'Invalid or expired token.'));
  }
}

export function requireRole(...roles: Array<'manager' | 'secretary'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as 'manager' | 'secretary')) {
      return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
    }
    next();
  };
}
