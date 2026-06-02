import * as mssql from 'mssql';
import { config } from './env';

/**
 * Database connection manager using mssql for Azure SQL Database.
 */
class Database {
  private pool: mssql.ConnectionPool | null = null;

  async connect(): Promise<void> {
    this.pool = new mssql.ConnectionPool({
      server: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: true,
        trustServerCertificate: config.nodeEnv !== 'production',
      },
    });

    await this.pool.connect();
    console.log('✅ Database connected successfully');
  }

  async getConnection(): Promise<mssql.ConnectionPool> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Convert `?` placeholders to mssql named parameters
   */
  private parseParams(sql: string, params?: any[]): { sql: string, request: mssql.Request } {
    if (!this.pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    const request = this.pool.request();

    if (!params || params.length === 0) {
      return { sql, request };
    }

    let sqlParsed = sql;
    params.forEach((param, index) => {
      sqlParsed = sqlParsed.replace('?', `@p${index}`);
      request.input(`p${index}`, param);
    });

    return { sql: sqlParsed, request };
  }

  /**
   * Execute a SELECT query and return the recordset
   */
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    const { sql: sqlParsed, request } = this.parseParams(sql, params);
    const result = await request.query(sqlParsed);
    return result.recordset as T[];
  }

  /**
   * Execute INSERT/UPDATE/DELETE and return rows affected
   */
  async execute(sql: string, params?: any[]): Promise<number> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    const { sql: sqlParsed, request } = this.parseParams(sql, params);
    const result = await request.query(sqlParsed);
    return result.rowsAffected[0];
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.log('Database connection closed');
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

export const database = new Database();