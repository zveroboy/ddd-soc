/* eslint-disable class-methods-use-this */
import { InvalidTokenException, User } from '#entities/user/index.js';
import { type DataAccess, EntityNotFoundError, EventBus, TYPES } from '#features/common/index.js';
import { inject, injectable } from 'inversify';

import { CONFIRMATION_TOKEN_LENGTH } from './const.js';
import { ConfirmationParams, LoginDto, RegisterDto } from './dto/index.js';
import { HashingService } from './hash.service.js';

@injectable()
export class AuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    @inject(TYPES.DataAccess) private dataAccess: DataAccess,
    @inject(TYPES.EventBus) private bus: EventBus
  ) {}

  async registerUser({ email, password }: RegisterDto): Promise<void> {
    const userRepository = this.dataAccess.getRepository(User);

    const confirmationToken = await HashingService.generateBytes(CONFIRMATION_TOKEN_LENGTH);
    const hashedPassword = await HashingService.hash(password);

    const userFields: Omit<User, 'userId'> = {
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

    this.bus.dispatch({
      name: 'user.registered',
      payload: userFields,
    });
  }

  async loginUser({ email, password }: LoginDto): Promise<boolean> {
    const userRepository = this.dataAccess.getRepository(User);
    const user = await userRepository.findOneBy({
      email,
    });

    if (!user) {
      return false;
    }

    return HashingService.compare(password, user.password);
  }

  async confirmUser({ token }: ConfirmationParams): Promise<void> {
    const userRepository = this.dataAccess.getRepository(User);

    const user = await userRepository.findOneBy({
      confirmationToken: token,
      confirmed: false,
    });

    if (!user) {
      throw new InvalidTokenException();
    }

    await userRepository.update(user.userId, { confirmationToken: null, confirmed: true });

    this.bus.dispatch({
      name: 'user.confirmed',
    });
  }
}
