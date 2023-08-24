import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  name = this.constructor.name;

  constructor(issue: string, public status: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(issue);
  }

  static isHttpError(error: Error): error is HttpError {
    return error instanceof HttpError;
  }
}
