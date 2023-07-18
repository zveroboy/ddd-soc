import dotenv from 'dotenv';
import express, { ErrorRequestHandler, Express, Request, Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import 'reflect-metadata';
import { QueryFailedError } from 'typeorm';

import AppDataSource from './database/data-source.js';
import { authRouter } from './features/auth/index.js';
import { HttpError } from './features/common/index.js';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app: Express = express();

// if (!AppDataSource.isInitialized) {
//   console.log('AppDataSource.initialize');
await AppDataSource.initialize();
// }

process.on('exit', (code) => {
  // AppDataSource from './data-source.js';
  // AppDataSource.destroy();
  console.log(`Caught exit ${code}`);
});

/**
 * @todo consider other signals
 */
// process.on('SIGINT', async () => {
//   console.time('AppDataSource.destroy');
//   await AppDataSource.destroy();
//   console.timeEnd('AppDataSource.destroy');
//   process.exit();
// });

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('foo bar');
});

app.use('/auth', authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorRequestHandler: ErrorRequestHandler = (error: Error, _req, res, _next) => {
  let httpError: HttpError;
  switch (error.constructor) {
    case HttpError:
      httpError = error as HttpError;
      break;
    case QueryFailedError:
      httpError = new HttpError(error.message, StatusCodes.UNPROCESSABLE_ENTITY);
      break;
    default:
      httpError = new HttpError((error.message ||= getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)));
      break;
  }

  res.status(httpError.status).send(httpError.message);
};

app.use(errorRequestHandler);

export { app };
