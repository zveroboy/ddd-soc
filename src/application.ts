import express, { ErrorRequestHandler, Express, Request, Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { interfaces } from 'inversify';

import AppDataSource from './database/data-source.js';
import { AuthController } from './features/auth/index.js';
import { Config, HttpError, TYPES, ValidationError } from './features/common/index.js';

export class Application {
  public app: Express;

  constructor(private container: interfaces.Container) {
    this.app = express();
    this.app.use(express.json());

    this.app.get('/', (req: Request, res: Response) => {
      res.send('foo bar');
    });

    this.app.use('/auth', this.container.get(AuthController).router);

    this.app.use(this.errorRequestHandler);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorRequestHandler: ErrorRequestHandler = (error: Error, _req, res, _next) => {
    let httpError: HttpError;
    console.error(error);
    switch (error.constructor) {
      case ValidationError:
        res.status((error as ValidationError).status).send(error);
        return;
      case HttpError:
        httpError = error as HttpError;
        break;
      default:
        httpError = new HttpError((error.message ||= getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)));
        break;
    }

    res.status(httpError.status).send({
      message: error.message,
      name: error.constructor.name,
    });
  };

  start() {
    const port = this.container.get<Config>(TYPES.Config).PORT;
    this.app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  }

  async destroy() {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }

  static async create(container: interfaces.Container): Promise<Application> {
    await AppDataSource.initialize();
    return new Application(container);
  }
}
