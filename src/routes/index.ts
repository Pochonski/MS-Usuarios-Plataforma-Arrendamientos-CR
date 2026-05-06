import { Router } from 'express';

import usuarioRoutes from './usuario.routes';
import { database } from '../config/database';

const router = Router();

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

// Mount routes
router.use('/', usuarioRoutes);

export default router;