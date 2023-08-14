import { AppDataSource } from '#database/index.js';
import { ContainerModule, interfaces } from 'inversify';

import { Config, config } from './config/index.js';
import { TYPES } from './constants.js';
import { DataAccess } from './db/index.js';
import { Mailer, NodeMailer } from './email/index.js';
import { ErrorController } from './error/index.js';
import { EventBus } from './event-bus/index.js';
import { ConsoleLogger, Logger } from './logger/index.js';

export const commonModule = new ContainerModule((bind) => {
  bind<Config>(TYPES.Config).toConstantValue(config);
  bind<DataAccess>(TYPES.DataAccess).toConstantValue(AppDataSource);
  bind<EventBus>(TYPES.EventBus).to(EventBus).inSingletonScope();
  bind<Mailer>(TYPES.Mailer)
    .toDynamicValue((context: interfaces.Context) => {
      const configService = context.container.get<Config>(TYPES.Config);
      return new NodeMailer(
        configService.MAILER_HOST,
        Number(configService.MAILER_PORT),
        false,
        configService.MAILER_USERNAME,
        configService.MAILER_PASSWORD
      );
    })
    .inSingletonScope();
  bind<Logger>(TYPES.Logger).to(ConsoleLogger);
  bind(ErrorController).toSelf();
});
