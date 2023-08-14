/* eslint-disable class-methods-use-this */

/* eslint-disable no-magic-numbers */
import AppDataSource from '#database/data-source.js';
import { EntityNotFoundError, type Mailer, TYPES } from '#features/common/index.js';
import { inject, injectable } from 'inversify';
import EventEmitter from 'node:events';

import { CONFIRMATION_TOKEN_LENGTH } from './const.js';
import { ConfirmationDto, LoginDto, RegisterDto } from './dto/index.js';
import { User } from './entities/index.js';
import { HashingService } from './hash.service.js';

@injectable()
export class AuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(@inject(TYPES.EventBus) private bus: EventEmitter) {}

  async registerUser({ email, password }: RegisterDto): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);

    const confirmationToken = await HashingService.generateBytes(CONFIRMATION_TOKEN_LENGTH);
    const hashedPassword = await HashingService.hash(password);

    const userFields = {
      confirmationToken,
      /**
       * Move this logic to model?
       * Factory should be responsible for creation of model in a valid state
       */
      confirmed: false,
      email,
      password: hashedPassword,
    };

    await userRepository.save(userFields);
    /**
     * Emit event instead
     */
    this.bus.emit('user.registered');
  }

  async loginUser({ email, password }: LoginDto): Promise<boolean> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      email,
    });

    if (!user) {
      return false;
    }

    return HashingService.compare(password, user.password);
  }

  async confirmUser({ token }: ConfirmationDto): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      confirmationToken: token,
    });

    if (!user) {
      throw new EntityNotFoundError('User associated with this token not found');
    }
  }

  // handle
}
