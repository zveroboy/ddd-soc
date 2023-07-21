import AppDataSource from '#database/data-source.js';
import { HttpError, ValidationError, isSchemaError } from '#features/common/index.js';
import { RequestHandler, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { QueryFailedError } from 'typeorm';

import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, RegisterSchema } from './dto/index.js';
import { User } from './entities/index.js';
import { HashingService } from './hash.service.js';

interface BaseController {
  router: Router;
}

@injectable()
export class AuthController implements BaseController {
  readonly router = Router();

  constructor(@inject(AuthService) private authService: AuthService) {
    this.router.post('/register', this.registerValidator, this.registerHandler);
    this.router.post('/login', this.loginHandler);
  }

  registerValidator: RequestHandler<unknown, unknown, RegisterDto> = (req, _res, next) => {
    try {
      req.body = RegisterSchema.parse(req.body);
      next();
    } catch (error) {
      if (isSchemaError(error)) {
        next(new ValidationError(error.issues));
      }
      next(error);
    }
  };

  registerHandler: RequestHandler<unknown, unknown, RegisterDto> = async (req, res, next) => {
    // const user = await userRepository.findOneBy({
    //   email: req.body.email,
    // });

    // if (user) {
    //   return next(new Error('Already exists'));
    // }

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

  loginHandler: RequestHandler<unknown, unknown, LoginDto> = async (req, res, next) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      email: req.body.email,
    });

    if (!user) {
      return next(new HttpError("Email of password didn't match", StatusCodes.FORBIDDEN));
    }

    const areEqual = await HashingService.compare(req.body.password, user.password);

    if (!areEqual) {
      return next(new HttpError("Email of password didn't match", StatusCodes.FORBIDDEN));
    }

    return res.sendStatus(StatusCodes.OK);
  };
}
