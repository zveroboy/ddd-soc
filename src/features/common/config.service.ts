import dotenv from 'dotenv';

const configResult = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

if (configResult.error) {
  throw configResult.error;
}

if (!configResult.parsed) {
  throw new Error('Config parse result in not defined');
}

export type Config = {
  PORT: string;
  DB_TYPE: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_SCHEMA: string;
  MAILER_HOST: string;
  MAILER_PORT: string;
  MAILER_USERNAME: string;
  MAILER_PASSWORD: string;
};

export const config = configResult.parsed as Config;
