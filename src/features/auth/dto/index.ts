import { z } from 'zod';

import { CONFIRMATION_TOKEN_LENGTH } from '../const.js';

const PASSWORD_MIN_LENGTH = 5;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH, {
    message: `Must be ${PASSWORD_MIN_LENGTH} or more characters long`,
  }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const ConfirmationSchema = z.object({
  token: z.string().length(CONFIRMATION_TOKEN_LENGTH),
});

export type ConfirmationDto = z.infer<typeof ConfirmationSchema>;
