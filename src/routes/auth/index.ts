import { Hono } from 'hono';
import { hashPassword, verifyPassword } from 'peta-auth';
import { route } from 'peta-hono';
import { requireAuth } from '../../middleware/auth';
import { User } from '../../models/user';
import type { AppEnv } from '../../types';
import { LoginBody, RegisterBody } from './schema';

const auth = new Hono<AppEnv>();

auth.post(
  '/register',
  route()
    .summary('Register a new user')
    .requestBody(RegisterBody)
    .response(201, { description: 'User created' })
    .response(400, { description: 'Validation error' })
    .handle(async (c) => {
      const { name, email, password } = c.req.valid('json');
      const existing = await User.query().where('email', '=', email).executeTakeFirst();
      if (existing) return c.json({ error: 'Email already registered' }, 400);
      const hashed = await hashPassword(password);
      const user = await User.insert({ name, email, password: hashed });
      const session = c.get('session');
      session.userId = user.get('id');
      await session.save();
      return c.json({ id: user.get('id'), name, email }, 201);
    }),
);

auth.post(
  '/login',
  route()
    .summary('Login')
    .requestBody(LoginBody)
    .response(200, { description: 'Logged in' })
    .response(401, { description: 'Invalid credentials' })
    .handle(async (c) => {
      const { email, password } = c.req.valid('json');
      const user = await User.query().where('email', '=', email).executeTakeFirst();
      if (!user) return c.json({ error: 'Invalid credentials' }, 401);
      const valid = await verifyPassword(user.get('password') as string, password);
      if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
      const session = c.get('session');
      session.userId = user.get('id');
      await session.save();
      return c.json({ id: user.get('id'), name: user.get('name'), email: user.get('email') });
    }),
);

auth.get(
  '/me',
  requireAuth,
  route()
    .summary('Get current user')
    .response(200, { description: 'Current user' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const user = await User.findOrFail(c.var.userId);
      return c.json({ id: user.get('id'), name: user.get('name'), email: user.get('email') });
    }),
);

auth.post(
  '/logout',
  route()
    .summary('Logout')
    .response(200, { description: 'Logged out' })
    .handle(async (c) => {
      const session = c.get('session');
      session.destroy();
      return c.json({ ok: true });
    }),
);

export default auth;
