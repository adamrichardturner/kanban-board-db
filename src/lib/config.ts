import dotenv from 'dotenv';
import { DatabaseConfig } from '../types/database.js';

dotenv.config();

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} environment variable is required`);
    process.exit(1);
  }
  return value;
}

export const config = {
  database: {
    host: requireEnvVar('POSTGRES_HOST'),
    port: parseInt(requireEnvVar('POSTGRES_PORT')),
    database: requireEnvVar('POSTGRES_DB'),
    user: requireEnvVar('POSTGRES_USER'),
    password: requireEnvVar('POSTGRES_PASSWORD'),
  } satisfies DatabaseConfig,
};

export default config;
