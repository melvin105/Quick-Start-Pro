import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'manager' | 'secretary' | 'instructor';
        staffId: string | null;
        jti: string;
        exp: number;
      };
    }
  }
}

export {};
