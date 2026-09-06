import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { isTokenRevoked } from '../services/authService';

interface JwtPayload {
  sub: string;
  role: 'manager' | 'secretary' | 'instructor';
  staffId: string | null;
  type?: string;
  jti: string;
  exp: number;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Missing or malformed Authorization header.');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Only an access token may authorize a protected route. A refresh token is
    // also a validly-signed JWT, so without this check it would be accepted here
    // too — letting a long-lived refresh token act as an access token and
    // defeating the short access TTL (token-confusion). Tokens minted before
    // this split carry no `type`; they're rejected, forcing a fresh login.
    if (payload.type !== 'access') {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid token.');
    }

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
    res.locals.authDurationMs = Date.now() - startedAt;
    next();
  } catch (err) {
    res.locals.authDurationMs = Date.now() - startedAt;
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
