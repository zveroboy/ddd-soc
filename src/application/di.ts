import { authModule } from '#features/auth/index.js';
import { commonModule } from '#features/common/index.js';
import { Container } from 'inversify';
import 'reflect-metadata';

import { appModule } from './application.module.js';

const container = new Container({ skipBaseClassChecks: true });
container.load(commonModule, authModule, appModule);

// container.bind<Config>(ConfigId).toConstantValue(config);
// container.bind<ApiService>(ApiServiceId).to(StarWarsApiService);
export { container };
