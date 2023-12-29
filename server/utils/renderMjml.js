import mjml2html from 'mjml';
import { logger } from '../logger/winston.js';

export default (template) => {
  try {
    const output = mjml2html(template);
    return output.html;
  } catch (e) {
    logger.error(e);
    // fall through to null
  }

  return null;
};
