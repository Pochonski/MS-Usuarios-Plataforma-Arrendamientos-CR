import rateLimit, { RateLimitRequestHandler, RateLimitExceededEventHandler } from 'express-rate-limit';
import { Request } from 'express';
import { config } from '../config/env';
import { generateRateLimitKey, shouldSkipRateLimit } from '../services/rateLimit.service';

const keyGenerator = (req: Request): string => generateRateLimitKey(req);

const skip = (req: Request): boolean => shouldSkipRateLimit(req);

const handleRateLimit: RateLimitExceededEventHandler = (req, res) => {
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Demasiadas solicitudes, intenta de nuevo mas tarde',
    retryAfter: Math.round(res.getHeader('Retry-After') as number || config.rateLimit.windowMs * 60),
  });
};

const baseOptions = {
  keyGenerator,
  skip,
  standardHeaders: true,
  legacyHeaders: false,
};

export const rateLimitAuth: RateLimitRequestHandler = rateLimit({
  ...baseOptions,
  windowMs: config.rateLimit.windowMs * 60 * 1000,
  max: config.rateLimit.auth.max,
  message: { error: `Demasiados intentos de autenticacion, intenta de nuevo en ${config.rateLimit.windowMs} minutos` },
  handler: handleRateLimit,
});

export const rateLimitRead: RateLimitRequestHandler = rateLimit({
  ...baseOptions,
  windowMs: config.rateLimit.windowMs * 60 * 1000,
  max: config.rateLimit.read.max,
  message: { error: `Demasiadas solicitudes de lectura, intenta de nuevo en ${config.rateLimit.windowMs} minutos` },
  handler: handleRateLimit,
});

export const rateLimitWrite: RateLimitRequestHandler = rateLimit({
  ...baseOptions,
  windowMs: config.rateLimit.windowMs * 60 * 1000,
  max: config.rateLimit.write.max,
  message: { error: `Demasiadas solicitudes de escritura, intenta de nuevo en ${config.rateLimit.windowMs} minutos` },
  handler: handleRateLimit,
});

export const rateLimitGeneral: RateLimitRequestHandler = rateLimit({
  ...baseOptions,
  windowMs: config.rateLimit.windowMs * 60 * 1000,
  max: config.rateLimit.general.max,
  message: { error: `Demasiadas solicitudes, intenta de nuevo en ${config.rateLimit.windowMs} minutos` },
  handler: handleRateLimit,
});