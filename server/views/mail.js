import renderMjml from '../utils/renderMjml';
import mailLayout from './mailLayout';
import consolidationMailLayout from './consolidationMailLayout';

export const renderAccountConsolidation = (data) => {
  const subject = 'p5.js Web Editor Account Consolidation';
  const templateOptions = {
    domain: data.body.domain,
    headingText: 'Account Consolidation',
    greetingText: 'Hello,',
    messageText: `You're receiving this message because you previous registered for the
                  <a href="https://editor.p5js.org">p5.js Web Editor</a>
                  using the same email address multiple times. In order to fix bugs and prevent future bugs,
                  your accounts have been consolidated to the first account you created. You can login with
                  the following email and username:`,
    username: data.body.username,
    email: data.body.email,
    message2Text: `All of your sketches and collections have been preserved and have not been modified.
                  If you have forgotten your password you can reset it:`,
    resetPasswordLink: 'reset-password',
    resetPasswordText: 'Reset Password',
    directLinkText: 'Or copy and paste the following URL into your browser:',
    noteText: `We are grateful for your patience and understanding. Thank you for supporting p5.js and the
              p5.js Web Editor!`,
    meta: {
      keywords: 'p5.js, p5.js web editor, web editor, processing, code editor',
      description:
        'A web editor for p5.js, a JavaScript library with the goal' +
        ' of making coding accessible to artists, designers, educators, and beginners.'
    }
  };

  // Return MJML string
  const template = consolidationMailLayout(templateOptions);

  // Render MJML to HTML string
  const html = renderMjml(template);

  // Return options to send mail
  return Object.assign({}, data, { html, subject });
};

export const renderResetPassword = (data) => {
  const subject = 'p5.js Web Editor Password Reset';
  const templateOptions = {
    domain: data.body.domain,
    headingText: 'Reset your password',
    greetingText: 'Hello,',
    messageText:
      'We received a request to reset the password for your account. To reset your password, click on the button below:', // eslint-disable-line max-len
    link: data.body.link,
    buttonText: 'Reset password',
    directLinkText: 'Or copy and paste the URL into your browser:',
    noteText:
      'If you did not request this, please ignore this email and your password will remain unchanged. Thanks for using the p5.js Web Editor!', // eslint-disable-line max-len
    meta: {
      keywords: 'p5.js, p5.js web editor, web editor, processing, code editor',
      description:
        'A web editor for p5.js, a JavaScript library with the goal' +
        ' of making coding accessible to artists, designers, educators, and beginners.'
    }
  };

  // Return MJML string
  const template = mailLayout(templateOptions);

  // Render MJML to HTML string
  const html = renderMjml(template);

  // Return options to send mail
  return Object.assign({}, data, { html, subject });
};

export const renderEmailConfirmation = (data) => {
  const subject = 'p5.js Email Verification';
  const templateOptions = {
    domain: data.body.domain,
    headingText: 'Email Verification',
    greetingText: 'Hello,',
    messageText: 'To verify your email, click on the button below:',
    link: data.body.link,
    buttonText: 'Verify Email',
    directLinkText: 'Or copy and paste the URL into your browser:',
    noteText:
      'This link is only valid for the next 24 hours. Thanks for using the p5.js Web Editor!',
    meta: {
      keywords: 'p5.js, p5.js web editor, web editor, processing, code editor',
      description:
        'A web editor for p5.js, a JavaScript library with the goal' +
        ' of making coding accessible to artists, designers, educators, and beginners.'
    }
  };

  // Return MJML string
  const template = mailLayout(templateOptions);

  // Render MJML to HTML string
  const html = renderMjml(template);

  // Return options to send mail
  return Object.assign({}, data, { html, subject });
};
