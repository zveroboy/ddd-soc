import { CONFIRMATION_TOKEN_LENGTH, ConfirmationParams, LoginDto, RegisterDto } from '#domain/index.js';
import { bytesToHexLength } from '#shared/bytes.js';
import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 5;

const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH, {
  message: `Must be ${PASSWORD_MIN_LENGTH} or more characters long`,
});

const emailSchema = z
  .string()
  .email()
  .transform((val) => val.toLowerCase());

const registerShape = {
  email: emailSchema,
  password: passwordSchema,
} satisfies Record<keyof RegisterDto, z.ZodTypeAny>;

export const RegisterSchema = z.object(registerShape);

const loginShape = {
  email: emailSchema,
  password: passwordSchema,
} satisfies Record<keyof LoginDto, z.ZodTypeAny>;

export const LoginSchema = z.object(loginShape);

const confirmationShape = {
  token: z.string().length(bytesToHexLength(CONFIRMATION_TOKEN_LENGTH)),
} satisfies Record<keyof ConfirmationParams, z.ZodTypeAny>;

export const confirmationSchema = z.object(confirmationShape);
