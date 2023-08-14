import { InvalidTokenException } from '#entities/user/index.js';
import { BaseController, HttpError, ValidationError, isSchemaError } from '#features/common/index.js';
import { Request, RequestHandler, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { QueryFailedError } from 'typeorm';

import { AuthService } from './auth.service.js';
import {
  ConfirmationParams,
  ConfirmationSchema,
  LoginDto,
  LoginSchema,
  RegisterDto,
  RegisterSchema,
} from './dto/index.js';

const validationHandler =
  <P = Record<string, string>, ResBody = unknown, ReqBody = unknown>(
    fn: (req: Request<P, ResBody, ReqBody>) => void
  ): RequestHandler<P, ResBody, ReqBody> =>
  (req, _res, next) => {
    try {
      fn(req);
      next();
    } catch (error) {
      if (isSchemaError(error)) {
        next(new ValidationError(error.issues));
      }
      next(error);
    }
  };

@injectable()
export class AuthController implements BaseController {
  readonly router = Router();

  constructor(@inject(AuthService) private authService: AuthService) {
    this.router.post('/register', this.registerValidator, this.registerHandler);
    this.router.post('/login', this.loginValidator, this.loginHandler);
    this.router.post('/confirm/:token', this.confirmationValidator, this.confirmationHandler);
  }

  registerValidator: RequestHandler<unknown, unknown, RegisterDto> = validationHandler((req) => {
    req.body = RegisterSchema.parse(req.body);
  });

  loginValidator: RequestHandler<unknown, unknown, LoginDto> = validationHandler((req) => {
    req.body = LoginSchema.parse(req.body);
  });

  confirmationValidator: RequestHandler<ConfirmationParams> = validationHandler((req) => {
    req.params = ConfirmationSchema.parse(req.params);
  });

  registerHandler: RequestHandler<unknown, unknown, RegisterDto> = async (req, res, next) => {
    try {
      await this.authService.registerUser(req.body);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return next(new HttpError(error.message, StatusCodes.UNPROCESSABLE_ENTITY));
      }
      return next(error);
    }

    return res.status(StatusCodes.CREATED).send();
  };

  loginHandler: RequestHandler<unknown, unknown, LoginDto> = async (req, res) => {
    const result = await this.authService.loginUser(req.body);
    if (!result) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }

    return res.status(StatusCodes.OK).send();
  };

  confirmationHandler: RequestHandler<ConfirmationParams> = async (req, res, next) => {
    try {
      await this.authService.confirmUser(req.params);
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        return next(new HttpError(error.message, StatusCodes.NOT_FOUND));
      }
      return next(error);
    }

    return res.sendStatus(StatusCodes.OK).send();
  };
}
