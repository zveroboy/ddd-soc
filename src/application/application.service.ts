import { AuthController } from '#features/auth/index.js';
import { type Config, type DataAccess, ErrorController, type Logger, TYPES } from '#features/common/index.js';
import express, { Express, Request, Response } from 'express';
import { inject, injectable, interfaces } from 'inversify';

@injectable()
export class ApplicationService {
  public app: Express;

  constructor(
    @inject(AuthController) private authController: AuthController,
    @inject(ErrorController) private errorController: ErrorController,
    @inject(TYPES.Config) private config: Config,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.DataAccess) private dataAccess: DataAccess
  ) {
    this.app = express();
    this.app.use(express.json());

    this.app.get('/', (req: Request, res: Response) => {
      res.send('foo bar');
    });

    this.app.use('/auth', this.authController.router);

    this.app.use(this.errorController.errorRequestHandler);
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
      container.get(ErrorController),
      container.get(TYPES.Config),
      container.get(TYPES.Logger),
      dataAccess
    );
  }
}
