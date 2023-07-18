/* eslint-disable sort-keys */
import dotenv from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const directory = dirname(fileURLToPath(import.meta.url));

const buildDataSource = () =>
  new DataSource({
    type: process.env.DB_TYPE as 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    entities: [`${directory}/../**/*.entity.{js,ts}`],
    migrations: [`${directory}/migrations/*.{js,ts}`],
    migrationsRun: false,
    synchronize: true,
    logging: false,
  });

export default buildDataSource();
