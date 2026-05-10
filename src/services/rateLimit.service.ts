import { Request } from 'express';
import { AuthRequest } from '../middlewares/auth';

export const generateRateLimitKey = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if ((req as AuthRequest).user?.id) {
    return `rl:${ip}:${(req as AuthRequest).user!.id}`;
  }

  return `rl:${ip}`;
};

export const shouldSkipRateLimit = (req: Request): boolean => {
  return req.path === '/api/health';
};