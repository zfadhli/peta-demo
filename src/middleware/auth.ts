import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = c.get('session');
  if (!session.userId) return c.json({ error: 'Not authenticated' }, 401);
  c.set('userId', session.userId as number);
  await next();
};
