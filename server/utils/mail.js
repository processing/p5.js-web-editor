'use strict';
/**
 * Mail service wrapping around mailgun
 */

import fsp from 'fs-promise';
import pug from 'pug';
import is from 'is_js';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

const auth = {
  api_key: process.env.MAILGUN_KEY,
  domain: process.env.MAILGUN_DOMAIN,
};

class Mail {
  constructor() {
    this.client = nodemailer.createTransport(mg({ auth }));
    this.sendOptions = {
      from: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY_TO,
    };
  }

  getMailTemplate(type) {
    let mailTemp;
    switch (type) {
      case 'reset-password':
        mailTemp = 'server/views/mailTemplates/reset-password.jade';
        break;
      case 'email-verification':
        mailTemp = 'server/views/mailTemplates/email-verification.jade';
        break;
    }
    return mailTemp;
  }

  sendMail(mailOptions) {
    return new Promise((resolve, reject) => {
      this.client.sendMail(mailOptions, (err, info) => {
        resolve(err, info);
      });
    });
  }

  dispatchMail(template, data, callback) {
    const self = this;
    return fsp.readFile(template, 'utf8')
    .then((file) => {
      const compiled = pug.compile(file, {
        filename: template,
      });
      const body = compiled(data.body);
      const mailOptions = {
        to: data.to,
        subject: data.subject,
        from: self.sendOptions.from,
        'h:Reply-To': self.sendOptions.replyTo,
        html: body,
      };
      return self.sendMail(mailOptions);
    })
    .then((err, res) => {
      callback(err, res);
    });
  }

  send(type, data, callback) {
    let template = null;
    if (is.existy(data.template)) {
      template = data.template;
    } else {
      template = this.getMailTemplate(type);
    }
    return this.dispatchMail(template, data, callback);
  }
}

export default new Mail();
