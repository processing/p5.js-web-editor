/* eslint-disable consistent-return */
import mjml2html from 'mjml';

/** Parse template string containing mjml tags into html for nodemailer.SendMailOptions.html */
export function renderMjml(template: string): string | undefined {
  try {
    const output = mjml2html(template);
    return output.html;
  } catch (e) {
    console.error(e);
    // fall through to undefined (null is not valid for nodemailer.SendMailOptions.html)
    return undefined;
  }
}
