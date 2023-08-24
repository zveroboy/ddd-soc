// import { ValidationError, isSchemaError } from '#features/infrastructure/index.js';
import { Request, RequestHandler } from 'express';

import { ValidationError, isSchemaError } from '../error/validation-error.js';

export const validationHandler =
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
