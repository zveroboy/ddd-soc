import { HttpError, RegisterCommand, RegisterCommandHandler } from '#application/index.js';
import { ConfirmationParams, InvalidTokenException, LoginDto, RegisterDto } from '#domain/index.js';
import { RequestHandler, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { QueryFailedError } from 'typeorm';

import { AuthService } from '../../domain/services/auth.service.js';
import { BaseController } from '../base.controller.js';
import { LoginSchema, RegisterSchema, confirmationSchema } from './dto/index.js';
import { validationHandler } from './validationHandler.js';

@injectable()
export class AuthController implements BaseController {
  readonly router = Router();

  constructor(
    @inject(RegisterCommandHandler) private registerCommandHandler: RegisterCommandHandler,
    @inject(AuthService) private authService: AuthService
  ) {
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
    req.params = confirmationSchema.parse(req.params);
  });

  registerHandler: RequestHandler<unknown, unknown, RegisterDto> = async (req, res, next) => {
    try {
      await this.registerCommandHandler.handle(new RegisterCommand(req.body));
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

    return res.status(StatusCodes.OK).send();
  };
}
