import z from 'zod';

/* eslint-disable */
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
/* eslint-enable */

const SignupFormInput = z.object({
  username: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[a-zA-Z0-9._-]{1,20}$/),
  email: z.string().email().regex(EMAIL_REGEX),
  password: z.string().min(6),
  confirmPassword: z
    .string()
    .min(6)
    .refine((confirmPassword, data) => confirmPassword === data.password, {
      message: "Passwords don't match",
      path: ['confirmPassword']
    })
});

const LoginFormInput = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default { SignupFormInput, LoginFormInput };
