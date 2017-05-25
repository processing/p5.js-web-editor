'use strict';
/**
 * Mail service wrapping around mailgun
 */

import fsp from 'fs-promise';
import pug from 'pug';
import is from 'is_js';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { mjml2html } from 'mjml'

import templates from '../views/mailTemplates';

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
    if (templates[type] != null) {
      return templates[type];
    }

    console.warn(`mail template '${type} not found`);
  }

  sendMail(mailOptions) {
    return new Promise((resolve, reject) => {
      this.client.sendMail(mailOptions, (err, info) => {
        resolve(err, info);
      });
    });
  }

  dispatchMail(template, data, callback) {
    const output = mjml2html(template(data.body));

    const mailOptions = {
      to: data.to,
      subject: data.subject,
      from: this.sendOptions.from,
      'h:Reply-To': this.sendOptions.replyTo,
      html: output.html,
    };

    return this.sendMail(mailOptions)
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
