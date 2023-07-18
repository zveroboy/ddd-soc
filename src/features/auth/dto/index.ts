import { z } from 'zod';

const passwordMinLength = 5;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(passwordMinLength, {
    message: `Must be ${passwordMinLength} or more characters long`,
  }),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(passwordMinLength, {
    message: `Must be ${passwordMinLength} or more characters long`,
  }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
