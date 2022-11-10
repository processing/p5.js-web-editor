/**
 * Mail service wrapping around mailgun
 */

import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

const auth = {
  api_key: process.env.MAILGUN_KEY,
  domain: process.env.MAILGUN_DOMAIN
};

class Mail {
  constructor() {
    this.client = nodemailer.createTransport(mg({ auth }));
    this.sendOptions = {
      from: process.env.EMAIL_SENDER
    };
  }

  sendMail(mailOptions) {
    return new Promise((resolve, reject) => {
      this.client.sendMail(mailOptions, (err, info) => {
        resolve(err, info);
      });
    });
  }

  dispatchMail(data, callback) {
    const mailOptions = {
      to: data.to,
      subject: data.subject,
      from: this.sendOptions.from,
      html: data.html
    };

    return this.sendMail(mailOptions).then((err, res) => {
      callback(err, res);
    });
  }

  send(data, callback) {
    return this.dispatchMail(data, callback);
  }
}

export default new Mail();
