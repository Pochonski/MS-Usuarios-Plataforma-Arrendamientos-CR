import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import usuarioRoutes from './usuario.routes';
import { database } from '../config/database';
import { swaggerSpec } from '../config/swagger';

const router = Router();

// Swagger documentation
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check with database connectivity verification
router.get('/health', async (req, res) => {
  const dbHealthy = await database.isHealthy();
  const status = dbHealthy ? 'healthy' : 'unhealthy';
  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    database: {
      status: dbHealthy ? 'connected' : 'disconnected',
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