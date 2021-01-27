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
  return new Promise((resolve, reject) => {
    function sendFailure(code, error) {
      res.status(code).json({ error });
      resolve();
    }

    User.findById(req.user.id, async (err, user) => {
      if (!user) {
        sendFailure(404, 'User not found');
        return;
      }

      if (!req.body.label) {
        sendFailure(
          400,
          "Expected field 'label' was not present in request body"
        );
        return;
      }

      const keyToBeHashed = await generateApiKey();

      const addedApiKeyIndex = user.apiKeys.push({
        label: req.body.label,
        hashedKey: keyToBeHashed
      });

      user.save((saveErr) => {
        if (saveErr) {
          sendFailure(500, saveErr);
          return;
        }

        const apiKeys = user.apiKeys.map((apiKey, index) => {
          const fields = apiKey.toObject();
          const shouldIncludeToken = index === addedApiKeyIndex - 1;

          return shouldIncludeToken
            ? { ...fields, token: keyToBeHashed }
            : fields;
        });

        res.json({ apiKeys });
        resolve();
      });
    });
  });
}

export function removeApiKey(req, res) {
  return new Promise((resolve, reject) => {
    function sendFailure(code, error) {
      res.status(code).json({ error });
      resolve();
    }

    User.findById(req.user.id, (err, user) => {
      if (err) {
        sendFailure(500, err);
        return;
      }

      if (!user) {
        sendFailure(404, 'User not found');
        return;
      }

      const keyToDelete = user.apiKeys.find(
        (key) => key.id === req.params.keyId
      );
      if (!keyToDelete) {
        sendFailure(404, 'Key does not exist for user');
        return;
      }

      user.apiKeys.pull({ _id: req.params.keyId });

      user.save((saveErr) => {
        if (saveErr) {
          sendFailure(500, saveErr);
          return;
        }

        res.status(200).json({ apiKeys: user.apiKeys });
        resolve();
      });
    });
  });
}
