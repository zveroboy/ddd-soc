import { ContainerModule, interfaces } from 'inversify';

import { Config, config } from './config.service.js';
import { Mailer, NodeMailer } from './email/index.js';
import { ConsoleLogger, Logger } from './logger.service.js';

export const TYPES = {
  Config: Symbol.for('Config'),
  Logger: Symbol.for('Logger'),
  Mailer: Symbol.for('Mailer'),
};

export const commonModule = new ContainerModule((bind) => {
  bind<Config>(TYPES.Config).toConstantValue(config);
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
});
