import AppDataSource from '#database/data-source.js';
import { HttpError } from '#features/common/index.js';
import { RequestHandler, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DeepPartial } from 'typeorm';

import { LoginDto, RegisterDto } from '../dto/index.js';
import { User } from '../entities/index.js';
import { HashingService } from '../hash-service.js';

const registerHandler: RequestHandler<unknown, unknown, RegisterDto> = async (req, res, next) => {
  const userRepository = AppDataSource.getRepository(User);
  // const user = await userRepository.findOneBy({
  //   email: req.body.email,
  // });

  // if (user) {
  //   return next(new Error('Already exists'));
  // }

  const createUser: DeepPartial<User> = {
    email: req.body.email,
    password: await HashingService.hash(req.body.password),
  };

  try {
    await userRepository.save(createUser);
  } catch (error) {
    next(error);
    return;
  }

  res.status(StatusCodes.CREATED).send(`${createUser.email} created`);
};

const loginHandler: RequestHandler<unknown, unknown, LoginDto> = async (req, res, next) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({
    email: req.body.email,
  });

  if (!user) {
    next(new HttpError("Email of password didn't match", StatusCodes.FORBIDDEN));
    return;
  }

  const areEqual = await HashingService.compare(req.body.password, user.password);

  if (!areEqual) {
    next(new HttpError("Email of password didn't match", StatusCodes.FORBIDDEN));
    return;
  }

  res.sendStatus(StatusCodes.OK);
};

const authRouter = Router();
authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);

export { authRouter };
