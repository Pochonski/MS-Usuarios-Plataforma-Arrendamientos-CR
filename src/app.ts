import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './config/env';
import { database } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

class App {
  public app: Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    // Security headers with Helmet
    this.app.use(helmet());

    // CORS - allow multiple frontend origins
    this.app.use(cors({
      origin: config.nodeEnv === 'production'
        ? [
            'https://arrendacr.com',
            'https://www.arrendacr.com',
            'https://agreeable-ground-0b1436910.6.azurestaticapps.net'
          ]
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'ocp-apim-subscription-key'],
      credentials: true,
    }));

    // Logging with Morgan
    this.app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

    // Rate limiting - general: 100 requests per 15 minutes
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos' },
    });
    this.app.use('/api', generalLimiter);

    // Rate limiting - auth routes: 5 requests per 15 minutes
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Demasiados intentos de inicio de sesion, intenta de nuevo en 15 minutos' },
    });
    this.app.use('/api/auth/login', authLimiter);
    this.app.use('/api/auth/registro', authLimiter);

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private configureRoutes(): void {
    this.app.use('/api', routes);
  }

  private configureErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   MS-Usuarios - Plataforma Arrendamientos CR               ║
║   Server running on port ${this.port}                            ║
║   Environment: ${config.nodeEnv}                                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    await database.close();
  }
}

export default App;