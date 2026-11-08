import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../user';

jest.setTimeout(30000); // give enough time for MongoMemoryServer

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '7.0.0' } // or latest supported stable version
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User model', () => {
  it('should hash password before saving', async () => {
    const user = new User({
      username: 'alice',
      email: 'alice@example.com',
      password: 'mypassword'
    });
    await user.save();

    expect(user.password).not.toBe('mypassword');
    const match = await bcrypt.compare('mypassword', user.password!);
    expect(match).toBe(true);
  });

  it('should compare passwords correctly', async () => {
    const user = new User({
      username: 'bob',
      email: 'bob@example.com',
      password: 'secret'
    });
    await user.save();

    const isMatch = await user.comparePassword('secret');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrong');
    expect(isNotMatch).toBe(false);
  });

  it('should expose virtual id as string', async () => {
    const user = new User({
      username: 'carol',
      email: 'carol@example.com',
      password: 'pass123'
    });
    await user.save();

    expect(user.id).toBe(user._id.toHexString());
  });

  it('should include virtuals in toJSON output', () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'secret'
    });
    expect(user.id).toBe(user._id.toHexString());

    const json = user.toJSON();
    expect(json).toHaveProperty('id', user._id.toHexString());
    expect(json).toHaveProperty('username', 'testuser');
    expect(json).toHaveProperty('email', 'test@example.com');
  });

  it('should find user by email (case insensitive)', async () => {
    await new User({
      username: 'dave',
      email: 'Dave@Example.com',
      password: 'pass'
    }).save();

    const found = await User.findByEmail('dave@example.com');
    expect(found).not.toBeNull();
    expect(found!.username).toBe('dave');
  });

  it('should find user by username (case insensitive)', async () => {
    await new User({
      username: 'Eve',
      email: 'eve@example.com',
      password: 'pass'
    }).save();

    const found = await User.findByUsername('eve', { caseInsensitive: true });
    expect(found).not.toBeNull();
    expect(found!.email).toBe('eve@example.com');
  });

  it('should return null for wrong username/email', async () => {
    const found = await User.findByEmail('nope@example.com');
    expect(found).toBeNull();
  });

  it('should define a single unique case-insensitive index per username/email', () => {
    const indexes = User.schema.indexes();
    const usernameIndexes = indexes.filter(
      ([fields]) => Object.keys(fields).length === 1 && fields.username === 1
    );
    const emailIndexes = indexes.filter(
      ([fields]) => Object.keys(fields).length === 1 && fields.email === 1
    );

    expect(usernameIndexes).toHaveLength(1);
    expect(emailIndexes).toHaveLength(1);
    expect(usernameIndexes[0][1]).toMatchObject({
      unique: true,
      collation: { locale: 'en', strength: 2 }
    });
    expect(emailIndexes[0][1]).toMatchObject({
      unique: true,
      collation: { locale: 'en', strength: 2 }
    });
  });

  it('should reject case-variant duplicate email via unique collation index', async () => {
    await new User({
      username: 'uniqueuser1',
      email: 'Case.Unique@Example.com',
      password: 'pass'
    }).save();

    await expect(
      new User({
        username: 'uniqueuser2',
        email: 'case.unique@example.com',
        password: 'pass'
      }).save()
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('should reject case-variant duplicate username via unique collation index', async () => {
    await new User({
      username: 'CaseUser',
      email: 'caseuser1@example.com',
      password: 'pass'
    }).save();

    await expect(
      new User({
        username: 'caseuser',
        email: 'caseuser2@example.com',
        password: 'pass'
      }).save()
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('should hash apiKeys on save and find matching key', async () => {
    const user = new User({
      username: 'frank',
      email: 'frank@example.com',
      apiKeys: [{ hashedKey: 'hashedApiKey' }]
    });
    await user.save();

    const savedUser = await User.findOne({ email: 'frank@example.com' });
    expect(savedUser).not.toBeNull();
    const keyObj = await savedUser!.findMatchingKey('hashedApiKey');
    expect(keyObj.isMatch).toBe(true);
    expect(keyObj.keyDocument).not.toBeNull();
  });
});
