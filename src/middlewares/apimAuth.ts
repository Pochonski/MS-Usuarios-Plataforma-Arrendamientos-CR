import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/env';

/**
 * Azure APIM Security Middleware
 *
 * Validates that requests come from Azure APIM by checking:
 * 1. Ocp-Apim-Subscription-Key header (APIM subscription key)
 * 2. X-ARR-ClientCert header (client certificate for mTLS)
 *
 * In production, APIM forwards requests with these headers after validation.
 * The certificate thumbprint is used to verify the caller is our APIM instance.
 */

export interface ApimRequest extends Request {
  apimValidated?: boolean;
}

const extractCertThumbprint = (certHeader: string): string | null => {
  try {
    // Certificate is base64 encoded DER format
    const certBuffer = Buffer.from(certHeader, 'base64');
    const hash = crypto.createHash('sha1').update(certBuffer).digest('hex').toUpperCase();
    return hash;
  } catch {
    return null;
  }
};

export const apimAuth = (
  req: ApimRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip validation in development if not enabled
  if (config.nodeEnv === 'development' && !config.apim.validateClientCert) {
    req.apimValidated = true;
    next();
    return;
  }

  const subscriptionKey = req.headers['ocp-apim-subscription-key'] as string;
  const clientCertHeader = req.headers['x-arr-clientcert'] as string;

  // Validate subscription key
  if (!subscriptionKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing Ocp-Apim-Subscription-Key header',
    });
    return;
  }

  if (subscriptionKey !== config.apim.subscriptionKey) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid subscription key',
    });
    return;
  }

  // Validate client certificate if configured
  if (config.apim.validateClientCert && clientCertHeader) {
    const thumbprint = extractCertThumbprint(clientCertHeader);

    if (!thumbprint) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid client certificate',
      });
      return;
    }

    if (thumbprint !== config.apim.clientCertThumbprint?.toUpperCase()) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid client certificate thumbprint',
      });
      return;
    }
  } else if (config.apim.validateClientCert && !clientCertHeader) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Client certificate required',
    });
    return;
  }

  req.apimValidated = true;
  next();
};

// Middleware to skip validation for health checks (APIM health probes)
export const apimAuthSkipHealth = (
  req: ApimRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.path === '/api/health') {
    req.apimValidated = true;
    next();
    return;
  }
  apimAuth(req, res, next);
};