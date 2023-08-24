import { HttpError } from '#application/index.js';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodIssue } from 'zod';

export class ValidationError extends HttpError {
  constructor(public issues: ZodIssue[], message = 'Invalid entity') {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

export const isSchemaError = (error: unknown): error is ZodError => error instanceof ZodError;
