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
    try {
      const response = await this.client.sendMail(mailOptions);
      return response;
    } catch (error) {
      console.error('Failed to send email: ', error);
      throw new Error('Email failed to send.');
    }
  }

  async send(data) {
    const mailOptions = {
      to: data.to,
      subject: data.subject,
      from: this.sendOptions.from,
      html: data.html
    };

    try {
      const response = await this.sendMail(mailOptions);
      return response;
    } catch (error) {
      console.error('Error in prepping email.', error);
      throw new Error('Error in prepping email.');
    }
  }
}

export default new Mail();
