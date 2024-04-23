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

  async sendMail(mailOptions) {
    const response = await this.client.sendMail(mailOptions);
    return response;
  }

  async send(data) {
    const mailOptions = {
      to: data.to,
      subject: data.subject,
      from: this.sendOptions.from,
      html: data.html
    };

    const response = await this.sendMail(mailOptions);
    return response;
  }
}

export default new Mail();
