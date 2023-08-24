import { RegisterDto } from '#domain/index.js';

export class RegisterCommand {
  /** @todo it's better to not rely directly on dto */
  // eslint-disable-next-line no-useless-constructor
  constructor(public dto: RegisterDto) {}
}
