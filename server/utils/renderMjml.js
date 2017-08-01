import { mjml2html } from 'mjml';

export default (template) => {
  try {
    const output = mjml2html(template);
    return output.html;
  } catch (e) {
    // fall through to null
  }

  return null;
};
