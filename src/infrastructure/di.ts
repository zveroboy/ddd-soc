import { Container } from 'inversify';
import 'reflect-metadata';

import { appModule } from './application.module.js';
import { authModule } from './auth/index.js';
import { commonModule } from './common.module.js';

const container = new Container({ skipBaseClassChecks: true });
container.load(commonModule, authModule, appModule);

export { container };
