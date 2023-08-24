import { Config } from '#application/index.js';
import dotenv from 'dotenv';

const configResult = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

if (configResult.error) {
  throw configResult.error;
}

if (!configResult.parsed) {
  throw new Error('Config parse result in not defined');
}

export const config = configResult.parsed as Config;
