import z from 'zod';
import { i18n } from 'i18next';

/* eslint-disable */
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
/* eslint-enable */

export const SignupFormInput = z.object({
  username: z
    .string({
      required_error: i18n.t('ReduxFormUtils.errorEmptyUsername')
    })
    .max(20, { message: i18n.t('ReduxFormUtils.errorLongUsername') })
    .regex(/^[a-zA-Z0-9._-]{1,20}$/, {
      message: i18n.t('ReduxFormUtils.errorValidUsername')
    }),
  email: z
    .string({
      required_error: i18n.t('ReduxFormUtils.errorEmptyEmail')
    })
    .email({ message: i18n.t('ReduxFormUtils.errorInvalidEmail') })
    .regex(EMAIL_REGEX, {
      message: i18n.t('ReduxFormUtils.errorInvalidEmail')
    }),
  password: z
    .string({
      required_error: i18n.t('ReduxFormUtils.errorEmptyPassword')
    })
    .min(6, { message: i18n.t('ReduxFormUtils.errorShortPassword') }),
  confirmPassword: z
    .string({
      required_error: i18n.t('ReduxFormUtils.errorEmptyConfirmPassword')
    })
    .min(6, { message: i18n.t('ReduxFormUtils.errorShortConfirmPassword') })
    .refine((confirmPassword, data) => confirmPassword === data.password, {
      message: i18n.t('ReduxFormUtils.errorPasswordMismatch'),
      path: ['confirmPassword']
    })
});

export const LoginFormInput = z.object({
  email: z
    .string({
      required_error: i18n.t('ReduxFormUtils.errorEmptyEmail')
    })
    .email({ message: i18n.t('ReduxFormUtils.errorInvalidEmail') }),
  password: z
    .string({
      required_error: i18n.t('ReduxFormUtils.errorEmptyPassword')
    })
    .min(6, { message: i18n.t('ReduxFormUtils.errorShortPassword') })
});
