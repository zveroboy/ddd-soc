import { type Config, EventBus, type Logger, TYPES } from '#application/index.js';
import express, { Express, Request, Response } from 'express';
import { inject, injectable, interfaces } from 'inversify';

import { AuthController, AuthEventHandler } from './auth/index.js';
import { type DataAccess } from './database/index.js';
import { ErrorController } from './error/index.js';

@injectable()
export class ApplicationService {
  public app: Express;

  constructor(
    /**
     * @todo Combine domain providers into app modules instead of loading one by one
     */
    @inject(AuthController) private authController: AuthController,
    @inject(AuthEventHandler) private authEventHandler: AuthEventHandler,

    @inject(ErrorController) private errorController: ErrorController,

    @inject(TYPES.EventBus) private bus: EventBus,
    @inject(TYPES.Config) private config: Config,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.DataAccess) private dataAccess: DataAccess
  ) {
    try {
      this.app = express();
      this.app.use(express.json());

      // this.app.use(() => {
      //   asyncLocalStorage.run({ requestId, startTime }, () => {
      //     logger.log('BEGIN');
      //     next();
      //   });
      // });

      /** @todo Return the current version */
      this.app.get('/', (req: Request, res: Response) => {
        res.send('version 1');
      });

      this.app.use('/auth', this.authController.router);

      this.app.use(this.errorController.errorRequestHandler);

      this.bus.use(this.authEventHandler);
    } catch (err) {
      console.log('App error', err);
      throw err;
    }
  }

  start() {
    const port = this.config.PORT;
    this.app.listen(port, () => {
      this.logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  }

  async destroy() {
    if (this.dataAccess.isInitialized) {
      await this.dataAccess.destroy();
    }
  }

  static async create({ container }: interfaces.Context): Promise<ApplicationService> {
    const dataAccess = container.get<DataAccess>(TYPES.DataAccess);
    await dataAccess.initialize();
    return new ApplicationService(
      container.get(AuthController),
      container.get(AuthEventHandler),

      container.get(ErrorController),

      container.get(TYPES.EventBus),
      container.get(TYPES.Config),
      container.get(TYPES.Logger),
      dataAccess
    );
  }
}
