import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import usuarioRoutes from './usuario.routes';
import { database } from '../config/database';
import { config } from '../config/env';
import { swaggerSpec } from '../config/swagger';

const router = Router();

// Swagger documentation
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check with database connectivity verification
router.get('/health', async (req, res) => {
  let dbHealthy = await database.isHealthy();

  if (!dbHealthy) {
    try {
      await database.reconnect();
      dbHealthy = await database.isHealthy();
    } catch {
      // reconnection failed
    }
  }

  const status = dbHealthy ? 'healthy' : 'unhealthy';
  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    database: {
      status: dbHealthy ? 'connected' : 'disconnected',
    },
    google: {
      configured: Boolean(config.google.clientId),
      // First 12 chars only, never the full client id in unauthenticated response
      clientIdPrefix: config.google.clientId ? config.google.clientId.slice(0, 12) : null,
    },
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check del servicio
 *     responses:
 *       200:
 *         description: Servicio saludable
 *       503:
 *         description: Servicio no saludable
 */

// Mount routes
router.use('/', usuarioRoutes);

export default router;