import { EntityNotFoundError, HttpError, TYPES } from '#application/index.js';
import { ErrorRequestHandler, Router } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { inject, injectable } from 'inversify';

import { BaseController } from '../base.controller.js';
import { type Logger } from '../logger/logger.service.js';
import { ValidationError } from './validation-error.js';

@injectable()
export class ErrorController implements BaseController {
  readonly router = Router();

  constructor(@inject(TYPES.Logger) private logger: Logger) {
    this.router.use(this.errorRequestHandler);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorRequestHandler: ErrorRequestHandler = (error: Error, _req, res, _next) => {
    let httpError: HttpError;

    this.logger.error({ error });

    switch (error.constructor) {
      case EntityNotFoundError:
        httpError = new HttpError((error.message ||= getReasonPhrase(StatusCodes.NOT_FOUND)), StatusCodes.NOT_FOUND);
        break;
      case ValidationError:
        return res.status((error as ValidationError).status).send(error);
      case HttpError:
        httpError = error as HttpError;
        break;
      default:
        httpError = new HttpError((error.message ||= getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)));
        break;
    }

    return res.status(httpError.status).send({
      message: error.message,
      name: error.constructor.name,
    });
  };
}
