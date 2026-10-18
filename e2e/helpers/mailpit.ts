import { requireEnv } from './require-env';

/**
 * Mailpit addresses derived from the MAILPIT_*_PORT vars in .env.e2e
 */
export const mailpitSmtpPort = () => requireEnv('MAILPIT_SMTP_PORT');
export const mailpitUiPort = () => requireEnv('MAILPIT_UI_PORT');
export const mailpitApiUrl = () => `http://localhost:${mailpitUiPort()}/api/v1`;
