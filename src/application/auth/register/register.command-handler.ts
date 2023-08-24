/* eslint-disable no-useless-constructor */
import { AuthService } from '#domain/index.js';
import { inject, injectable } from 'inversify';

import { CommandHandler } from '../../command.js';
import { TYPES } from '../../constants.js';
import { EventBus } from '../../core/index.js';
import { RegisterCommand } from './register.command.js';

@injectable()
export class RegisterCommandHandler implements CommandHandler<RegisterCommand> {
  constructor(@inject(TYPES.EventBus) private bus: EventBus, @inject(AuthService) private authService: AuthService) {}

  async handle(command: RegisterCommand): Promise<void> {
    this.bus.dispatch(await this.authService.registerUser(command.dto));
  }
}
