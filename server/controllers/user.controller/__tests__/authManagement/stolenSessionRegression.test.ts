/*
 * Regression tests for the remaining takeover vectors from the advisory:
 * OAuth unlink/link and API key creation with only a stolen session. Unlink
 * and API key creation are gated at the route level (requireStepUp), and the
 * OAuth linking paths are guarded both at the start route and inside the
 * passport verify callbacks.
 */
import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import passport from 'passport';
import { User } from '../../../../models/user';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/mail');
jest.mock('../../../../views/mail');

let githubVerify: Function;
let googleVerify: Function;
let basicVerify: Function;

beforeAll(() => {
  process.env.GOOGLE_ID = 'x';
  process.env.GOOGLE_SECRET = 'x';
  process.env.GITHUB_ID = 'x';
  process.env.GITHUB_SECRET = 'x';
  process.env.EDITOR_URL = 'http://localhost';
  // eslint-disable-next-line global-require
  require('../../../../config/passport');
  githubVerify = (passport as any)._strategy('github')._verify;
  googleVerify = (passport as any)._strategy('google')._verify;
  basicVerify = (passport as any)._strategy('basic')._verify;
});

beforeEach(() => {
  jest.clearAllMocks();
});

const noExistingLink = () =>
  jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

/** Finds a route layer on an express router by path and method */
const findRoute = (router: any, method: string, path: string) =>
  router.stack.find(
    (layer: any) => layer.route?.path === path && layer.route?.methods[method]
  );

const routeHandlerNames = (router: any, method: string, path: string) =>
  findRoute(router, method, path).route.stack.map(
    (layer: any) => layer.handle.name
  );

describe('sensitive routes are gated behind authentication and step-up', () => {
  // eslint-disable-next-line global-require
  const userRoutes = require('../../../../routes/user.routes').default;

  it.each([
    ['delete', '/auth/github'],
    ['delete', '/auth/google'],
    ['post', '/account/api-keys']
  ])('%s %s requires isAuthenticated and requireStepUp', (method, path) => {
    const names = routeHandlerNames(userRoutes, method as string, path);
    expect(names).toContain('isAuthenticated');
    expect(names).toContain('requireStepUp');
  });

  it('removing an API key needs authentication but no step-up', () => {
    const names = routeHandlerNames(
      userRoutes,
      'delete',
      '/account/api-keys/:keyId'
    );
    expect(names).toContain('isAuthenticated');
    expect(names).not.toContain('requireStepUp');
  });
});

describe('the OAuth start routes refuse linking without a step-up', () => {
  // eslint-disable-next-line global-require
  const passportRoutes = require('../../../../routes/passport.routes').default;

  it.each(['/auth/github', '/auth/google'])(
    'GET %s redirects a logged-in user without step-up to the account page',
    (path) => {
      const guard = findRoute(passportRoutes, 'get', path).route.stack[0]
        .handle;
      const req: any = new MockRequest();
      req.user = { id: '1' };
      req.session = {};
      const res: any = new MockResponse();
      const next = jest.fn();

      guard(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        '/account?error=stepUpRequired'
      );
      expect(next).not.toHaveBeenCalled();
    }
  );

  it('GET /auth/github lets a logged-out user through to sign in', () => {
    const guard = findRoute(passportRoutes, 'get', '/auth/github').route
      .stack[0].handle;
    const req: any = new MockRequest();
    req.session = {};
    const res: any = new MockResponse();
    const next = jest.fn();

    guard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});

describe('the OAuth callbacks refuse linking without a step-up', () => {
  const makeVictim = (): any => ({
    username: 'victim',
    email: 'victim@example.com',
    tokens: [],
    banned: false,
    save: jest.fn().mockResolvedValue(null)
  });

  it('GitHub: a session alone cannot attach a new GitHub identity', async () => {
    const victim = makeVictim();
    (User as any).findOne = noExistingLink();

    const done = jest.fn();
    await githubVerify(
      { user: victim, session: {} },
      'attacker-token',
      undefined,
      { id: 'attacker-gh-id', username: 'attacker', emails: [] },
      done
    );

    expect(done).toHaveBeenCalledWith(null, false, {
      msg: expect.stringContaining('confirm')
    });
    expect(victim.github).toBeUndefined();
    expect(victim.save).not.toHaveBeenCalled();
  });

  it('GitHub: the owner can link after a recent step-up', async () => {
    const victim = makeVictim();
    (User as any).findOne = noExistingLink();

    const done = jest.fn();
    await githubVerify(
      { user: victim, session: { stepUpAt: Date.now() } },
      'owner-token',
      undefined,
      { id: 'owner-gh-id', username: 'victim', emails: [] },
      done
    );

    expect(done).toHaveBeenCalledWith(null, victim);
    expect(victim.github).toBe('owner-gh-id');
  });

  it('GitHub: plain sign-in without a session is unaffected', async () => {
    const existingUser = { ...makeVictim(), github: 'gh-id' };
    (User as any).findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });

    const done = jest.fn();
    await githubVerify(
      {},
      'token',
      undefined,
      { id: 'gh-id', username: 'victim', emails: [] },
      done
    );

    expect(User.findOne).toHaveBeenCalledWith({ github: 'gh-id' });
    expect(done).toHaveBeenCalledWith(null, existingUser);
  });

  it('Google: a session alone cannot attach a new Google identity', async () => {
    const victim = makeVictim();
    (User as any).findOne = noExistingLink();

    const done = jest.fn();
    await googleVerify(
      { user: victim, session: {} },
      'attacker-token',
      undefined,
      { _json: { emails: [{ value: 'attacker@gmail.com' }] } },
      done
    );

    expect(done).toHaveBeenCalledWith(null, false, {
      msg: expect.stringContaining('confirm')
    });
    expect(victim.google).toBeUndefined();
    expect(victim.save).not.toHaveBeenCalled();
  });

  it('Google: the owner can link after a recent step-up', async () => {
    const victim = makeVictim();
    (User as any).findOne = noExistingLink();

    const done = jest.fn();
    await googleVerify(
      { user: victim, session: { stepUpAt: Date.now() } },
      'owner-token',
      undefined,
      { _json: { emails: [{ value: 'victim@gmail.com' }] } },
      done
    );

    expect(done).toHaveBeenCalledWith(null, victim);
    expect(victim.google).toBe('victim@gmail.com');
  });
});

describe('API keys still authenticate over basic auth once legitimately created', () => {
  it('authenticates a valid username and key', async () => {
    const victim: any = {
      username: 'victim',
      banned: false,
      findMatchingKey: jest
        .fn()
        .mockResolvedValue({ isMatch: true, keyDocument: {} }),
      save: jest.fn().mockResolvedValue(null)
    };
    (User as any).findByUsername = jest.fn().mockResolvedValue(victim);

    const done = jest.fn();
    await basicVerify('victim', 'the-key', done);
    expect(done).toHaveBeenCalledWith(null, victim);
  });
});
