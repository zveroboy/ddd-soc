import { ContainerModule } from 'inversify';

import { ApplicationService } from './application.service.js';

export const appModule = new ContainerModule((bind) => {
  bind(ApplicationService).toDynamicValue(ApplicationService.create).inSingletonScope();
});
