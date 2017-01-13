const jwt = require('jsonwebtoken');


class Auth {
  /**
  * Create a verification token using jwt
  */
  createVerificationToken(email, fromEmail) {
    return jwt.sign({
      email,
      fromEmail,
    }, process.env.SECRET_TOKEN, {
      expiresIn: '1 day',
      subject: 'email-verification',
    });
  }

  /**
  * Verify token
  */
  verifyEmailToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.SECRET_TOKEN, (err, data) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            reject('The verification link has expired');
          } else if (err.name === 'JsonWebTokenError') {
            reject('Verification link is malformend');
          }
        }
        resolve(data);
      });
    });
  }
}

export default new Auth();
