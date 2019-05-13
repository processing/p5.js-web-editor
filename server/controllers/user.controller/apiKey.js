import crypto from 'crypto';

import User from '../../models/user';

/**
 * Generates a unique token to be used as a Personal Access Token
 * @returns Promise<String> A promise that resolves to the token, or an Error
 */
function generateApiKey() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        reject(err);
      }
      const key = buf.toString('hex');
      resolve(Buffer.from(key).toString('base64'));
    });
  });
}

export function createApiKey(req, res) {
  User.findById(req.user.id, async (err, user) => {
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!req.body.label) {
      res.status(400).json({ error: 'Expected field \'label\' was not present in request body' });
      return;
    }

    const hashedKey = await generateApiKey();

    user.apiKeys.push({ label: req.body.label, hashedKey });

    user.save((saveErr) => {
      if (saveErr) {
        res.status(500).json({ error: saveErr });
        return;
      }

      res.json({ token: hashedKey });
    });
  });
}

export function removeApiKey(req, res) {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const keyToDelete = user.apiKeys.find(key => key.id === req.params.keyId);
    if (!keyToDelete) {
      res.status(404).json({ error: 'Key does not exist for user' });
      return;
    }
    user.apiKeys.pull({ _id: req.params.keyId });
    saveUser(res, user);
  });
}
