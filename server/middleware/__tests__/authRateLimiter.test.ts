import type { Server } from 'http';
import type { AddressInfo } from 'net';
import Express, { Router } from 'express';
import { MemoryStore } from 'express-rate-limit';
import sessionRouter from '../../routes/session.routes';
import userRouter from '../../routes/user.routes';
import { authRateLimiter, createAuthRateLimiter } from '../authRateLimiter';

type RouteLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ handle: Express.RequestHandler }>;
  };
};

function listen(
  app: Express.Express
): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
    server.on('error', reject);
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function createLimitedApp(limiter: Express.RequestHandler) {
  const app = Express();
  app.use(Express.json());
  app.post('/editor/login', limiter, (_req, res) => {
    res.status(401).json({ message: 'Invalid username or password.' });
  });
  app.post('/editor/signup', limiter, (_req, res) => {
    res.status(400).json({ message: 'Invalid signup.' });
  });
  app.get('/editor/signup/duplicate_check', limiter, (_req, res) => {
    res.json({ exists: false });
  });
  app.post('/editor/reset-password', limiter, (_req, res) => {
    res.json({ success: true });
  });
  app.post('/editor/reset-password/:token', limiter, (_req, res) => {
    res.json({ success: true });
  });
  app.get('/editor/session', (_req, res) => {
    res.json({ user: null });
  });
  return app;
}

function handlersFor(
  router: Router,
  path: string,
  method: string
): Express.RequestHandler[] {
  const layer = (router.stack as RouteLayer[]).find(
    (entry) =>
      entry.route?.path === path && Boolean(entry.route.methods[method])
  );
  return layer?.route?.stack.map((item) => item.handle) ?? [];
}

describe('authRateLimiter', () => {
  const stores: MemoryStore[] = [];

  afterEach(async () => {
    await Promise.all(stores.splice(0).map((store) => store.shutdown()));
  });

  async function createLimitedClient(limit = 3) {
    const store = new MemoryStore();
    stores.push(store);
    const limiter = createAuthRateLimiter({
      windowMs: 60 * 1000,
      limit,
      store,
      validate: false
    });
    const { server, baseUrl } = await listen(createLimitedApp(limiter));
    return { server, baseUrl, limit };
  }

  it('allows requests up to the threshold, then returns 429 JSON and Retry-After', async () => {
    const { server, baseUrl, limit } = await createLimitedClient(3);

    try {
      const statuses: number[] = [];
      // Hits must be sequential so the in-memory limiter observes each request.
      for (let i = 0; i < limit; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const response = await fetch(`${baseUrl}/editor/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'bad@example.com', password: 'nope' })
        });
        statuses.push(response.status);
        expect(response.status).toBe(401);
      }

      const limited = await fetch(`${baseUrl}/editor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad@example.com', password: 'nope' })
      });

      expect(statuses).toEqual([401, 401, 401]);
      expect(limited.status).toBe(429);
      expect(limited.headers.get('Retry-After')).toBeTruthy();
      await expect(limited.json()).resolves.toEqual({
        message: 'Too many requests, please try again later.'
      });
    } finally {
      await closeServer(server);
    }
  });

  it('shares one IP bucket across signup and reset-password routes', async () => {
    const { server, baseUrl } = await createLimitedClient(2);

    try {
      const signup = await fetch(`${baseUrl}/editor/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'a', email: 'a@b.co', password: 'x' })
      });
      const duplicateCheck = await fetch(
        `${baseUrl}/editor/signup/duplicate_check?username=a`
      );
      const reset = await fetch(`${baseUrl}/editor/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.co' })
      });
      const resetToken = await fetch(
        `${baseUrl}/editor/reset-password/test-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'new-password' })
        }
      );

      expect(signup.status).toBe(400);
      expect(duplicateCheck.status).toBe(200);
      expect(reset.status).toBe(429);
      expect(resetToken.status).toBe(429);
    } finally {
      await closeServer(server);
    }
  });

  it('does not rate-limit unrelated session reads', async () => {
    const { server, baseUrl } = await createLimitedClient(1);

    try {
      const first = await fetch(`${baseUrl}/editor/session`);
      const second = await fetch(`${baseUrl}/editor/session`);
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
    } finally {
      await closeServer(server);
    }
  });

  it('attaches the shared limiter to the listed auth routes only', () => {
    expect(handlersFor(sessionRouter, '/login', 'post')).toContain(
      authRateLimiter
    );
    expect(handlersFor(sessionRouter, '/session', 'get')).not.toContain(
      authRateLimiter
    );
    expect(handlersFor(userRouter, '/signup', 'post')).toContain(
      authRateLimiter
    );
    expect(handlersFor(userRouter, '/signup/duplicate_check', 'get')).toContain(
      authRateLimiter
    );
    expect(handlersFor(userRouter, '/reset-password', 'post')).toContain(
      authRateLimiter
    );
    expect(handlersFor(userRouter, '/reset-password/:token', 'post')).toContain(
      authRateLimiter
    );
    expect(
      handlersFor(userRouter, '/reset-password/:token', 'get')
    ).not.toContain(authRateLimiter);
  });
});
