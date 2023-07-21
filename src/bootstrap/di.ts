import { authModule } from '#features/auth/index.js';
import { commonModule } from '#features/common/index.js';
import { Container } from 'inversify';
import 'reflect-metadata';

const container = new Container();
container.load(commonModule, authModule);

// container.bind<Config>(ConfigId).toConstantValue(config);
// container.bind<ApiService>(ApiServiceId).to(StarWarsApiService);
export { container };
