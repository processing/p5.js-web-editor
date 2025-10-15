import mongoose, { model } from 'mongoose';
import { apiKeySchema } from '../apiKey';

const ApiKey = model('ApiKey', apiKeySchema);

describe('ApiKey schema', () => {
  it('should set default label and generate an id virtual', () => {
    const doc = new ApiKey({ hashedKey: 'supersecret' });

    expect(doc.label).toBe('API Key');

    // _id is always generated
    expect(doc._id).toBeInstanceOf(mongoose.Types.ObjectId);

    // id virtual is stringified _id
    expect(typeof doc.id).toBe('string');
    expect(doc.id).toEqual(doc._id.toHexString());
  });

  it('should exclude hashedKey from toObject and toJSON', () => {
    const doc = new ApiKey({ hashedKey: 'supersecret', label: 'Test Key' });

    const obj = doc.toObject();
    const json = doc.toJSON();

    expect(obj).not.toHaveProperty('hashedKey');
    expect(json).not.toHaveProperty('hashedKey');
  });

  it('should include id, label, lastUsedAt, createdAt and updatedAt in output', () => {
    const now = new Date();
    const doc = new ApiKey({
      hashedKey: 'supersecret',
      label: 'My Key',
      lastUsedAt: now
    });

    // mock timestamps (normally set on save)
    doc.createdAt = new Date('2025-01-01T00:00:00Z');
    doc.updatedAt = new Date('2025-01-02T00:00:00Z');

    const obj = doc.toObject();

    expect(obj).toMatchObject({
      id: expect.any(String),
      label: 'My Key',
      lastUsedAt: now,
      createdAt: new Date('2025-01-01T00:00:00Z')
    });
  });
});
