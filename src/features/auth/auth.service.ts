/* eslint-disable class-methods-use-this */

/* eslint-disable no-magic-numbers */
import AppDataSource from '#database/data-source.js';
import { type Mailer, TYPES } from '#features/common/index.js';
import { inject, injectable } from 'inversify';

import { LoginDto, RegisterDto } from './dto/index.js';
import { User } from './entities/index.js';
import { HashingService } from './hash.service.js';

@injectable()
export class AuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(@inject(TYPES.Mailer) private mailer: Mailer) {}

  async registerUser({ email, password }: RegisterDto): Promise<void> {
    const confirmationLength = 16;
    const userRepository = AppDataSource.getRepository(User);

    const confirmationToken = await HashingService.generateBytes(confirmationLength);
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
    await this.mailer.send(confirmationToken);
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
}
