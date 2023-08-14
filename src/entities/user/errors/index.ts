/* eslint-disable max-classes-per-file */
export class UnmatchedException extends Error {
  name = this.constructor.name;

  constructor() {
    super("Email of password didn't match");
  }
}

export class InvalidTokenException extends Error {
  name = this.constructor.name;

  constructor() {
    super('User with provided token is not found');
  }
}
