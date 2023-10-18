import crypto from 'crypto';

import User from '../../models/user';

function sendFailure(res, code, error) {
  res.status(code).json({ error });
}

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

export async function createApiKey(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      sendFailure(res, 404, 'User not found');
      return;
    }

    if (!req.body.label) {
      sendFailure(
        res,
        400,
        "Expected field 'label' was not present in the request body"
      );
      return;
    }

    const keyToBeHashed = await generateApiKey();

    const addedApiKeyIndex = user.apiKeys.push({
      label: req.body.label,
      hashedKey: keyToBeHashed
    });

    await user.save();

    const apiKeys = user.apiKeys.map((apiKey, index) => {
      const fields = apiKey.toObject();
      const shouldIncludeToken = index === addedApiKeyIndex - 1;

      return shouldIncludeToken ? { ...fields, token: keyToBeHashed } : fields;
    });

    res.json({ apiKeys });
  } catch (error) {
    sendFailure(res, 500, error);
  }
}

export async function removeApiKey(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      sendFailure(res, 404, 'User not found');
      return;
    }

    const keyToDelete = user.apiKeys.find((key) => key.id === req.params.keyId);

    if (!keyToDelete) {
      sendFailure(res, 404, 'Key does not exist for user');
      return;
    }

    user.apiKeys.pull({ _id: req.params.keyId });

    await user.save();

    res.status(200).json({ apiKeys: user.apiKeys });
  } catch (error) {
    sendFailure(res, 500, error);
  }
}
