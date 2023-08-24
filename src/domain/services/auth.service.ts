/* eslint-disable class-methods-use-this */
import { inject, injectable } from 'inversify';

import { TYPES } from '../constants.js';
import {
  CONFIRMATION_TOKEN_LENGTH,
  ConfirmationParams,
  InvalidTokenException,
  LoginDto,
  RegisterDto,
  User,
  type UserRepository,
} from '../entities/users/index.js';
import { Event } from '../events.js';
import { EncodingService } from './encoding.service.js';

@injectable()
export class AuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) {}

  async registerUser({ email, password }: RegisterDto): Promise<Event[]> {
    const confirmationToken = await EncodingService.generateBytes(CONFIRMATION_TOKEN_LENGTH);
    const hashedPassword = await EncodingService.hash(password);

    const user = User.create({
      confirmationToken,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user.consumeEvents();
  }

  async loginUser({ email, password }: LoginDto): Promise<boolean> {
    const user = await this.userRepository.findOne({
      select: {
        password: true,
      },
      where: { email },
    });

    if (!user) {
      return false;
    }

    return EncodingService.compare(password, user.password);
  }

  async confirmUser({ token }: ConfirmationParams): Promise<Event[]> {
    const user = await this.userRepository.findOneBy({
      confirmationToken: token,
      confirmed: false,
    });

    if (!user) {
      throw new InvalidTokenException();
    }

    user.confirm();
    await this.userRepository.update(user.userId, user);

    return user.consumeEvents();
  }
}
