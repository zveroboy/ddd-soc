import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  constructor(message: string, public status: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = this.constructor.name;
  }

  static isHttpError(error: Error): error is HttpError {
    return error instanceof HttpError;
  }
}
