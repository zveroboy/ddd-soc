import { RegisterDto } from '#domain/index.js';

export class ConfirmationCommand {
  // eslint-disable-next-line no-useless-constructor
  constructor(public token: RegisterDto) {}
}
