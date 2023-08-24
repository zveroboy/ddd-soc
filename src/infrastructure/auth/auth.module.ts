import { RegisterCommandHandler } from '#application/index.js';
import { AuthService, TYPES as DOMAIN_TYPES, type UserRepository } from '#domain/index.js';
import { ContainerModule } from 'inversify';

import { TYPES } from '../constants.js';
import { DataAccess } from '../database/data-access.js';
import { AuthController } from './auth.controller.js';
import { AuthEventHandler } from './auth.handler.js';
import { UserEntity } from './user.entity.js';

export const authModule = new ContainerModule((bind) => {
  bind<UserRepository>(DOMAIN_TYPES.UserRepository).toDynamicValue((context) => {
    const dataAccess = context.container.get<DataAccess>(TYPES.DataAccess);
    return dataAccess.getRepository(UserEntity);
  });
  bind<AuthService>(AuthService).toSelf();
  bind<AuthController>(AuthController).toSelf();
  bind<RegisterCommandHandler>(RegisterCommandHandler).toSelf();
  bind<AuthEventHandler>(AuthEventHandler).toSelf();
});
