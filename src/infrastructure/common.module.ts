import { TYPES as APP_TYPES, Config, EventBus, Mailer } from '#application/index.js';
import { ContainerModule, interfaces } from 'inversify';

import { config } from './config/index.js';
import { AppDataSource, DataAccess } from './database/index.js';
import { NodeMailer } from './email/index.js';
import { ErrorController } from './error/index.js';
import { ConsoleLogger, Logger } from './logger/index.js';

export const commonModule = new ContainerModule((bind) => {
  bind<Config>(APP_TYPES.Config).toConstantValue(config);
  bind<DataAccess>(APP_TYPES.DataAccess).toConstantValue(AppDataSource);
  bind<EventBus>(APP_TYPES.EventBus).to(EventBus).inSingletonScope();
  bind<Mailer>(APP_TYPES.Mailer)
    .toDynamicValue((context: interfaces.Context) => {
      const configService = context.container.get<Config>(APP_TYPES.Config);
      return new NodeMailer(
        configService.MAILER_HOST,
        Number(configService.MAILER_PORT),
        false,
        configService.MAILER_USERNAME,
        configService.MAILER_PASSWORD
      );
    })
    .inSingletonScope();
  bind<Logger>(APP_TYPES.Logger).to(ConsoleLogger);
  bind(ErrorController).toSelf();
});
