const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// See: https://auth0.com/blog/ten-things-you-should-know-about-tokens-and-cookies/#confidential-info
function encryptAesSha256(password, textToEncrypt) {
  const cipher = crypto.createCipher('aes-256-cbc', password);
  let crypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decryptAesSha256(password, textToDecrypt) {
  const cipher = crypto.createDecipher('aes-256-cbc', password);
  let decrypted = cipher.update(textToDecrypt, 'hex', 'utf8');
  decrypted += cipher.final('utf8');
  return decrypted;
}

class Auth {
  /**
  * Create a verification token using jwt
  */
  createVerificationToken(email, fromEmail) {
    const encrypted = encryptAesSha256(
      process.env.EMAIL_VERIFY_SECRET_TOKEN,
      JSON.stringify({
        email,
        fromEmail,
      })
    );

    const payload = { token: encrypted };

    return jwt.sign(payload, process.env.EMAIL_VERIFY_SECRET_TOKEN, {
      expiresIn: '1 day',
      subject: 'email-verification',
    });
  }

  /**
  * Verify token
  */
  // TODO: Should fail if token has expired
  verifyEmailToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.EMAIL_VERIFY_SECRET_TOKEN, (err, data) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            reject('The verification link has expired');
            return;
          } else if (err.name === 'JsonWebTokenError') {
            reject('Verification link is malformend');
            return;
          }
        }

        if (data.token != null) {
          try {
            const payload = decryptAesSha256(process.env.EMAIL_VERIFY_SECRET_TOKEN, data.token);
            resolve(JSON.parse(payload));
          } catch (parseErr) {
            reject('Error parsing payload');
          }
          return;
        }
        reject('Token not found in payload');
      });
    });
  }
}

export default new Auth();
