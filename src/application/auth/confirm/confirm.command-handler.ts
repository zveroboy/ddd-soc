/* eslint-disable no-useless-constructor */
import { AuthService } from '#domain/index.js';
import { inject, injectable } from 'inversify';

import { CommandHandler } from '../../command.js';
import { TYPES } from '../../constants.js';
import { EventBus } from '../../core/index.js';
import { RegisterCommand } from './confirm.command.js';

@injectable()
export class ConfirmationCommandHandler implements CommandHandler<ConfirmationCommand> {
  constructor(@inject(TYPES.EventBus) private bus: EventBus, @inject(AuthService) private authService: AuthService) {}

  async handle(command: ConfirmationCommand): Promise<void> {
    this.bus.dispatch(await this.authService.registerUser(command.dto));
  }
}
