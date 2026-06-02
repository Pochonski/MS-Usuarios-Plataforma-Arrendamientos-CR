import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  error: string;
  message: string;
  path?: string;
  method?: string;
  stack?: string;
}

const log = (entry: LogEntry): void => {
  if (process.env.NODE_ENV === 'test') return;
  const output = JSON.stringify(entry);
  if (entry.level === 'error') {
    console.error(output);
  } else if (entry.level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const level = statusCode >= 500 ? 'error' : 'warn';

  log({
    timestamp: new Date().toISOString(),
    level,
    error: err.name || 'Error',
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    error: err.name || 'Error',
    message: err.statusCode ? err.message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  log({
    timestamp: new Date().toISOString(),
    level: 'warn',
    error: 'Not Found',
    message: `Ruta ${req.method} ${req.path} no encontrada`,
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Ruta ${req.method} ${req.path} no encontrada`,
  });
};

export class HttpError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) { super(message, 400); this.name = 'BadRequestError'; }
}
export class UnauthorizedError extends HttpError {
  constructor(message: string) { super(message, 401); this.name = 'UnauthorizedError'; }
}
export class ForbiddenError extends HttpError {
  constructor(message: string) { super(message, 403); this.name = 'ForbiddenError'; }
}
export class NotFoundError extends HttpError {
  constructor(message: string) { super(message, 404); this.name = 'NotFoundError'; }
}
export class ConflictError extends HttpError {
  constructor(message: string) { super(message, 409); this.name = 'ConflictError'; }
}