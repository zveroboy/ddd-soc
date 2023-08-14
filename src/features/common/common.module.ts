import EventEmitter from 'events';
import { ContainerModule, interfaces } from 'inversify';

import { Config, config } from './config/index.js';
import { TYPES } from './constants.js';
import { Mailer, NodeMailer } from './email/index.js';
import { ErrorController } from './error/index.js';
import { ConsoleLogger, Logger } from './logger/index.js';

export const commonModule = new ContainerModule((bind) => {
  bind<Config>(TYPES.Config).toConstantValue(config);
  bind<EventEmitter>(TYPES.EventBus).toConstantValue(new EventEmitter());
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
