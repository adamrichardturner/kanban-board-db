import { Client, ClientConfig } from 'pg';
import { DatabaseConfig } from '../types/database';

export class DatabaseClient {
  private client: Client;

  constructor(config: DatabaseConfig) {
    this.client = new Client(config as ClientConfig);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.client.query(text, params);
    return result.rows;
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] || null;
  }

  async transaction<T>(callback: (client: Client) => Promise<T>): Promise<T> {
    try {
      await this.client.query('BEGIN');
      const result = await callback(this.client);
      await this.client.query('COMMIT');
      return result;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }
}
