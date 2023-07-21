import { ContainerModule } from 'inversify';

import { AuthService } from './auth.service.js';
import { AuthController } from './index.js';

// export const TYPES = {
//   AuthController: Symbol.for(AuthController.name),
// };

export const authModule = new ContainerModule((bind) => {
  bind<AuthService>(AuthService).toSelf();
  bind<AuthController>(AuthController).toSelf().inSingletonScope();
});
