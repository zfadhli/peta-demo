import { Hono } from 'hono';
import { session } from 'peta-auth/hono';
import { getOpenAPISpec, loadRoutes, serveScalarUI } from 'peta-hono';
import { peta, runMigrations } from './db';
import logger from './logger';
import { Comment } from './models/comment';
import { Post } from './models/post';
import { User } from './models/user';
import type { AppEnv } from './types';

peta.registerAll([User, Post, Comment]);
await runMigrations();

const app = new Hono<AppEnv>();

const sessionSecret = process.env.SESSION_SECRET || 'a'.repeat(32);

app.use('*', session({ password: sessionSecret, cookieName: 'blog_session' }));

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: Date.now() - start,
  });
});

// app.route('/api/auth', auth);
// app.route('/api/posts', posts);
// app.route('/api', comments);

// Auto-load routes from ./routes directory, mounted under /api
await loadRoutes(app as unknown as Hono, new URL('./routes', import.meta.url).pathname, {
  basePath: '/api',
});

const info = { title: 'Blog API', version: '1.0.0' };
app.get('/openapi.json', (c) => c.json(getOpenAPISpec(app, info, undefined, { basePath: '/api' })));
app.get('/docs', serveScalarUI({ specUrl: '/openapi.json' }));

process.on('SIGINT', async () => {
  await peta.destroy();
  process.exit(0);
});

const port = Number(process.env.PORT) || 4300;
Bun.serve({ fetch: app.fetch, port });
