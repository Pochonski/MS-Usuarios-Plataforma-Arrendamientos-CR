import { Router } from 'express';

import usuarioRoutes from './usuario.routes';
import propiedadRoutes from './propiedad.routes';
import invitacionRoutes from './invitacion.routes';
import contratoRoutes from './contrato.routes';
import pagoRoutes from './pago.routes';
import notificacionRoutes from './notificacion.routes';
import chatRoutes from './chat.routes';
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
router.use('/', propiedadRoutes);
router.use('/', invitacionRoutes);
router.use('/', contratoRoutes);
router.use('/', pagoRoutes);
router.use('/', notificacionRoutes);
router.use('/', chatRoutes);

export default router;