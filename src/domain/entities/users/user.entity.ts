/* eslint-disable no-useless-constructor */

/* eslint-disable max-classes-per-file */
import { AggregateRoot, Event } from '#shared/index.js';

export interface UserProps {
  userId: string;

  email: string;

  password: string;

  confirmed: boolean;

  confirmationToken: string | null;
}

export class UserRegisteredEvent extends Event {
  name = 'user.registered';

  constructor(public user: UserProps) {
    super();
  }
}

export class UserConfirmedEvent extends Event {
  name = 'user.confirmed';
}

export class User extends AggregateRoot implements UserProps {
  declare userId: string;

  declare email: string;

  declare password: string;

  declare confirmed: boolean;

  declare confirmationToken: string | null;

  confirm(): void {
    this.confirmationToken = null;
    this.confirmed = true;
    this.raise(new UserConfirmedEvent());
  }

  static create(initial: Pick<UserProps, 'confirmationToken' | 'email' | 'password'>): User {
    const user = new User();
    Object.assign(user, initial);
    user.confirmed = false;
    user.raise(new UserRegisteredEvent({ ...user }));
    return user;
  }
}
