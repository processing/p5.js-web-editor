import crypto from 'crypto';
import { RequestHandler } from 'express';
import { User } from '../../models/user';
import type {
  ApiKeyResponseOrError,
  CreateApiKeyRequestBody,
  RemoveApiKeyRequestParams
} from '../../types';

/**
 * Generates a unique token to be used as a Personal Access Token
 * @returns Promise<String> A promise that resolves to the token, or an Error
 */
function generateApiKey(): Promise<string> {
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

/**
 * - Method: `POST`
 * - Endpoint: `/account/api-keys`
 * - Authenticated: `true`
 * - Id: `UserController.createApiKey`
 *
 * Description:
 *   - Create API key
 */
export const createApiKey: RequestHandler<
  {},
  ApiKeyResponseOrError,
  CreateApiKeyRequestBody
> = async (req, res) => {
  function sendFailure(code: number, error: string) {
    res.status(code).json({ error });
  }

  try {
    const user = await User.findById(req.user!.id);

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

    await user.save();

    const apiKeys = user.apiKeys.map((apiKey, index) => {
      const fields = apiKey.toObject!();
      const shouldIncludeToken = index === addedApiKeyIndex - 1;

      return shouldIncludeToken ? { ...fields, token: keyToBeHashed } : fields;
    });

    res.json({ apiKeys });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * - Method: `DELETE`
 * - Endpoint: `/account/api-keys/:keyId`
 * - Authenticated: `true`
 * - Id: `UserController.removeApiKey`
 *
 * Description:
 *   - Remove API key
 */
export const removeApiKey: RequestHandler<
  RemoveApiKeyRequestParams,
  ApiKeyResponseOrError
> = async (req, res) => {
  function sendFailure(code: number, error: string) {
    res.status(code).json({ error });
  }

  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      sendFailure(404, 'User not found');
      return;
    }

    const keyToDelete = user.apiKeys.find((key) => key.id === req.params.keyId);

    if (!keyToDelete) {
      sendFailure(404, 'Key does not exist for user');
      return;
    }

    user.apiKeys.pull({ _id: req.params.keyId });
    await user.save();

    res.status(200).json({ apiKeys: user.apiKeys });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
