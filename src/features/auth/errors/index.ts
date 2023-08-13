import { HttpError } from '#features/common/index.js';
import { StatusCodes } from 'http-status-codes';

export class UnmatchedError extends HttpError {
  name = this.constructor.name;

  constructor() {
    super("Email of password didn't match", StatusCodes.FORBIDDEN);
  }
}
