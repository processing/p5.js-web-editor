/* eslint-disable no-unused-vars */
import crypto from 'crypto';

import { Response as MockResponse } from 'jest-express/lib/response';
import { Response } from 'express';
import { userResponse, generateToken, userExists, saveUser } from '../helpers';
import { createMockUser } from '../__testUtils__';
import { User } from '../../../models/user';
import { UserDocument } from '../../../types';

jest.mock('../../../models/user');

const mockFullUser = createMockUser(
  {
    // sensitive fields to be removed:
    name: 'bob dylan',
    tokens: [],
    password: 'password12314',
    resetPasswordToken: 'wijroaijwoer',
    banned: true
  },
  true
) as UserDocument;

const {
  name,
  tokens,
  password,
  resetPasswordToken,
  banned,
  ...sanitised
} = mockFullUser;

describe('user.controller > helpers', () => {
  describe('userResponse', () => {
    it('returns a sanitized PublicUser object', () => {
      const result = userResponse(mockFullUser);
      expect(result).toMatchObject(sanitised);
    });
  });

  describe('generateToken', () => {
    it('generates a random hex string of length 40', async () => {
      const token = await generateToken();
      expect(typeof token).toBe('string');
      expect(token).toMatch(/^[a-f0-9]+$/);
      expect(token).toHaveLength(40);
    });

    it('rejects if crypto.randomBytes errors', async () => {
      const spy = jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementationOnce((_size, cb) => {
          cb(new Error('fail'), Buffer.alloc(0));
          return {};
        });

      await expect(generateToken()).rejects.toThrow('fail');

      spy.mockRestore();
    });
  });

  describe('saveUser', () => {
    it('returns a response with a sanitised user if user.save succeeds', async () => {
      const userWithSuccessfulSave = {
        ...mockFullUser,
        save: jest.fn().mockResolvedValue(null)
      };
      const response = new MockResponse();
      await saveUser(
        (response as unknown) as Response,
        (userWithSuccessfulSave as unknown) as UserDocument
      );
      expect(response.json).toHaveBeenCalledWith(sanitised);
    });

    it('returns a 500 Error if user.save fails', async () => {
      const userWithUnsuccessfulSave = {
        ...mockFullUser,
        save: jest.fn().mockRejectedValue('async error')
      };
      const response = new MockResponse();
      await saveUser(
        (response as unknown) as Response,
        (userWithUnsuccessfulSave as unknown) as UserDocument
      );
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        error: 'async error'
      });
    });
  });

  describe('userExists', () => {
    it('returns true when User.findByUsername returns non-nullish', async () => {
      User.findByUsername = jest.fn().mockResolvedValue({ id: 'something' });
      const exists = await userExists('someusername');
      expect(exists).toBe(true);
    });
    it('returns false when User.findByUsername returns nullish', async () => {
      User.findByUsername = jest.fn().mockResolvedValue(null);
      const exists = await userExists('someusername');
      expect(exists).toBe(false);
    });
  });
});
