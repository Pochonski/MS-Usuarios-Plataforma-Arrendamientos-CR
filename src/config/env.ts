import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    name: process.env.DB_NAME || 'arrendamientos_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  apim: {
    subscriptionKey: process.env.APIM_SUBSCRIPTION_KEY || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RL_WINDOW_MINUTES || '15', 10),
    auth: {
      max: parseInt(process.env.RL_AUTH_MAX || '5', 10),
    },
    read: {
      max: parseInt(process.env.RL_READ_MAX || '200', 10),
    },
    write: {
      max: parseInt(process.env.RL_WRITE_MAX || '50', 10),
    },
    general: {
      max: parseInt(process.env.RL_GENERAL_MAX || '100', 10),
    },
  },
};