/*
 * Regression tests for the "session to persistent account takeover" advisory.
 * Each test is the inversion of a proof-of-concept that confirmed the
 * vulnerable behaviour: a session alone must no longer be enough to change
 * credentials, and credential changes must log out every other session.
 */
import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import passport from 'passport';
import { User } from '../../../../models/user';
import {
  updateSettings,
  resetPasswordInitiate,
  updatePassword
} from '../../authManagement';
import { saveUser, generateToken } from '../../helpers';
import { getEditorUrl } from '../../../../utils/editorUrl';
import { mailerService } from '../../../../utils/mail';
import {
  renderResetPassword,
  renderEmailConfirmation
} from '../../../../views/mail';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/mail');
jest.mock('../../../../views/mail');
jest.mock('../../../../utils/editorUrl', () => ({
  getEditorUrl: jest.fn(() => 'https://editor.example')
}));
jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'),
  saveUser: jest.fn(),
  generateToken: jest.fn()
}));

const STATUSES = { Sent: 'sent', Verified: 'verified' };

beforeEach(() => {
  jest.clearAllMocks();
  (User as any).EmailConfirmation = jest.fn().mockReturnValue(STATUSES);
  (saveUser as jest.Mock).mockResolvedValue(null);
  (generateToken as jest.Mock).mockResolvedValue('tok');
  (mailerService.send as jest.Mock).mockResolvedValue(true);
});

const makeRequest = (session: Record<string, any> = {}) => {
  const req: any = new MockRequest();
  req.user = { id: '1' };
  req.session = session;
  req.logIn = jest.fn((user: unknown, cb: (err?: unknown) => void) => cb());
  return req;
};

describe('a social-only account cannot get a password without re-auth', () => {
  const makeVictim = (): any => ({
    id: '1',
    username: 'victim',
    email: 'victim@example.com',
    password: undefined,
    google: 'victim@gmail.com',
    apiKeys: [],
    comparePassword: jest.fn(),
    save: jest.fn().mockResolvedValue(null)
  });

  it('refuses newPassword with only a session, and saves nothing', async () => {
    const victim = makeVictim();
    (User as any).findById = jest.fn().mockResolvedValue(victim);

    const req = makeRequest();
    req.setBody({
      username: 'victim',
      email: 'victim@example.com',
      newPassword: 'attacker-pass'
    });
    const res: any = new MockResponse();

    await updateSettings(req, res, jest.fn());

    expect(victim.password).toBeUndefined();
    expect(victim.save).not.toHaveBeenCalled();
    expect(saveUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'step_up_required' });
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('allows the owner to set a first password after a step-up', async () => {
    const victim = makeVictim();
    (User as any).findById = jest.fn().mockResolvedValue(victim);

    const req = makeRequest({ stepUpAt: Date.now() });
    req.setBody({
      username: 'victim',
      email: 'victim@example.com',
      newPassword: 'owner-pass'
    });
    const res: any = new MockResponse();

    await updateSettings(req, res, jest.fn());

    expect(victim.password).toBe('owner-pass');
    expect(victim.save).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(403);
  });
});

describe('the email cannot be changed with only a session', () => {
  it('refuses the change, leaving email and verified state untouched', async () => {
    const victim: any = {
      id: '1',
      username: 'victim',
      email: 'victim@example.com',
      password: 'hashed',
      verified: 'verified',
      apiKeys: [],
      comparePassword: jest.fn(),
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findById = jest.fn().mockResolvedValue(victim);

    const req = makeRequest();
    req.setBody({ username: 'victim', email: 'attacker@gmail.com' });
    const res: any = new MockResponse();

    await updateSettings(req, res, jest.fn());

    expect(victim.email).toBe('victim@example.com');
    expect(victim.verified).toBe('verified');
    expect(victim.save).not.toHaveBeenCalled();
    expect(saveUser).not.toHaveBeenCalled();
    expect(mailerService.send).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'step_up_required' });
  });
});

describe("a reset link is only ever sent to the account's stored address", () => {
  // The protection against a reset link reaching an attacker is that the
  // stored address cannot be changed with only a session (tested above), not
  // whether that address has been confirmed.
  it('sends to user.email, not to the address typed into the request', async () => {
    const owner: any = {
      email: 'owner@example.com',
      verified: 'sent',
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findByEmail = jest.fn().mockResolvedValue(owner);

    const req: any = new MockRequest();
    req.setBody({ email: 'OWNER@example.com' });
    const res: any = new MockResponse();

    await resetPasswordInitiate(req, res, jest.fn());

    expect(owner.resetPasswordToken).toBe('tok');
    expect(mailerService.send).toHaveBeenCalledTimes(1);
    expect(renderResetPassword).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'owner@example.com' })
    );
  });
});

describe("links in emails ignore the request's Host header", () => {
  // The Host header is client-controlled. Building links from it lets an
  // attacker get a genuine reset email sent whose link points at their own
  // site, leaking the reset token when the victim clicks it.
  it('builds the reset link from EDITOR_URL', async () => {
    const owner: any = {
      email: 'owner@example.com',
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findByEmail = jest.fn().mockResolvedValue(owner);

    const req: any = new MockRequest();
    req.headers.host = 'evil.example';
    req.setBody({ email: 'owner@example.com' });
    const res: any = new MockResponse();

    await resetPasswordInitiate(req, res, jest.fn());

    expect(renderResetPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          domain: 'https://editor.example',
          link: 'https://editor.example/reset-password/tok'
        }
      })
    );
  });

  it('builds the confirmation link for a changed email from EDITOR_URL', async () => {
    const owner: any = {
      id: '1',
      username: 'owner',
      email: 'owner@example.com',
      password: 'hashed',
      apiKeys: [],
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findById = jest.fn().mockResolvedValue(owner);

    const req = makeRequest({ stepUpAt: Date.now() });
    req.headers.host = 'evil.example';
    req.setBody({ username: 'owner', email: 'new@example.com' });
    const res: any = new MockResponse();

    await updateSettings(req, res, jest.fn());

    expect(renderEmailConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          domain: 'https://editor.example',
          link: 'https://editor.example/verify?t=tok'
        }
      })
    );
  });

  it('issues no reset token if EDITOR_URL is unset', async () => {
    (getEditorUrl as jest.Mock).mockImplementationOnce(() => {
      throw new Error('EDITOR_URL missing from environment');
    });
    const owner: any = {
      email: 'owner@example.com',
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findByEmail = jest.fn().mockResolvedValue(owner);

    const req: any = new MockRequest();
    req.setBody({ email: 'owner@example.com' });
    const res: any = new MockResponse();

    await resetPasswordInitiate(req, res, jest.fn());

    expect(owner.resetPasswordToken).toBeUndefined();
    expect(owner.save).not.toHaveBeenCalled();
    expect(mailerService.send).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: false });
  });
});

describe('a password reset revokes every other session', () => {
  it('bumps sessionVersion so stale sessions fail deserialization', async () => {
    const victim: any = {
      email: 'victim@example.com',
      apiKeys: [],
      sessionVersion: 0,
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(victim) });

    const req = makeRequest();
    req.params = { token: 'tok' };
    req.setBody({ password: 'new' });
    req.logIn = jest.fn((user: unknown, cb: (err?: unknown) => void) => {
      req.user = user;
      cb();
    });

    await updatePassword(req, new MockResponse() as any, jest.fn());

    expect(victim.password).toBe('new');
    expect(victim.sessionVersion).toBe(1);
    // the current request is re-logged-in so its session is re-serialized
    // with the new version
    expect(req.logIn).toHaveBeenCalled();
  });
});

describe('session serialization carries the session version', () => {
  let serializeUser: Function;
  let deserializeUser: Function;

  beforeAll(() => {
    process.env.GOOGLE_ID = 'x';
    process.env.GOOGLE_SECRET = 'x';
    process.env.GITHUB_ID = 'x';
    process.env.GITHUB_SECRET = 'x';
    // eslint-disable-next-line global-require
    require('../../../../config/passport');
    [serializeUser] = (passport as any)._serializers;
    [deserializeUser] = (passport as any)._deserializers;
  });

  it('registers the Google callback URL from EDITOR_URL', () => {
    expect((passport as any)._strategy('google')._callbackURL).toBe(
      'https://editor.example/auth/google/callback'
    );
  });

  it('serializes the id together with the current sessionVersion', () => {
    const done = jest.fn();
    serializeUser({ id: '1', sessionVersion: 3 }, done);
    expect(done).toHaveBeenCalledWith(null, { id: '1', v: 3 });
  });

  it('accepts a legacy plain-string session when the user is at version 0', async () => {
    const victim = { id: '1', sessionVersion: 0 };
    (User as any).findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(victim) });

    const done = jest.fn();
    await deserializeUser('1', done);
    expect(User.findById).toHaveBeenCalledWith('1');
    expect(done).toHaveBeenCalledWith(null, victim);
  });

  it('rejects a session serialized before the version was bumped', async () => {
    const victim = { id: '1', sessionVersion: 1 };
    (User as any).findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(victim) });

    const done = jest.fn();
    await deserializeUser({ id: '1', v: 0 }, done);
    expect(done).toHaveBeenCalledWith(null, false);
  });

  it('accepts a session matching the current version', async () => {
    const victim = { id: '1', sessionVersion: 1 };
    (User as any).findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(victim) });

    const done = jest.fn();
    await deserializeUser({ id: '1', v: 1 }, done);
    expect(done).toHaveBeenCalledWith(null, victim);
  });
});
