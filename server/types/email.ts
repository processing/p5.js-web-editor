/** Possible email confirmation states */
export const EmailConfirmationStates = {
  Verified: 'verified',
  Sent: 'sent',
  Resent: 'resent'
} as const;

/** Rendered mail data for the mailer service, without the 'from' property, which will be automatically added */
export interface RenderedMailerData {
  to: string;
  subject: string;
  html?: string;
}

// -------- EMAIL OPTIONS --------
/** Options to generate the account consolidation email */
export interface AccountConsolidationEmailOptions {
  body: {
    domain: string;
    username: string;
    email: string;
  };
  to: string;
}
/** Options to generate the reset password email */
export interface ResetPasswordEmailOptions {
  body: {
    domain: string;
    link: string;
  };
  to: string;
}
/** Options to generate the confirm email email */
export interface ConfirmEmailEmailOptions {
  body: {
    domain: string;
    link: string;
  };
  to: string;
}
/** Options to generate the step-up verification code email */
export interface StepUpCodeEmailOptions {
  body: {
    domain: string;
    code: string;
  };
  to: string;
}
/** Options to generate the notice sent to the old address after an email change */
export interface EmailChangedNoticeEmailOptions {
  body: {
    domain: string;
    newEmail: string;
  };
  to: string;
}

// -------- EMAIL RENDERING TEMPLATES --------
/** Base template for emails */
export interface BaseEmailTemplate {
  domain: string;
  headingText: string;
  greetingText: string;
  messageText: string;
  directLinkText: string;
  noteText: string;
  meta: {
    keywords: string;
    description: string;
  };
}
/** Template for an email with a primary button, which contains text and a link */
export interface EmailWithPrimaryButtonTemplate extends BaseEmailTemplate {
  link: string;
  buttonText: string;
}
/** Template for rendering the account consolidation email */
export interface AccountConsolidationEmailTemplate extends BaseEmailTemplate {
  username: string;
  email: string;
  message2Text: string;
  resetPasswordLink: string;
  resetPasswordText: string;
}
/** Template for an email without any action link, optionally highlighting a short text (e.g. a code) */
export interface NoticeEmailTemplate
  extends Omit<BaseEmailTemplate, 'directLinkText'> {
  highlightText?: string;
}
/** Template for rendering the step-up verification code email */
export type StepUpCodeEmailTemplate = NoticeEmailTemplate;
/** Template for rendering the email changed notice */
export type EmailChangedNoticeEmailTemplate = NoticeEmailTemplate;
/** Template for rendering the confirm email email */
export type ConfirmEmailEmailTemplate = EmailWithPrimaryButtonTemplate;
/** Template for rendering the reset password email */
export type ResetPasswordEmailTemplate = EmailWithPrimaryButtonTemplate;
