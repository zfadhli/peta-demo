import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { session } from 'peta-auth/hono';
import { getOpenAPISpec, loadRoutes, serveScalarUI } from 'peta-hono';
import { loadMigrationFiles, MigrationRunner } from 'peta-orm/migrator';
import { peta } from '@/db';
import { errorResponse } from '@/errors';
import logger from '@/logger';
import type { AppEnv } from '@/types';

peta.discover('./src/models/*.ts');

const runner = new MigrationRunner(peta.kysely);
const migrations = await loadMigrationFiles('./migrations');
await runner.ensureTable();
await runner.up(migrations);

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

// Auto-load routes from ./routes directory, mounted under /api
app.notFound((c) => errorResponse(c, 404, 'Not found'));

app.onError((err, c) => {
  logger.error({ err, method: c.req.method, path: c.req.path }, 'Unhandled error');

  if (err instanceof HTTPException) {
    return errorResponse(c, err.status, err.message || 'Error');
  }

  if (err.name === 'ModelNotFoundError') {
    return errorResponse(c, 404, 'Not found');
  }

  if (err.name === 'ValidationError') {
    return errorResponse(c, 400, 'Validation failed');
  }

  if (err.name === 'DatabaseError') {
    const dbErr = err as unknown as { code: string };
    if (dbErr.code === 'UNIQUE_CONSTRAINT') {
      return errorResponse(c, 409, 'Conflict');
    }
    return errorResponse(c, 500, 'Database error');
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'SQLITE_CONSTRAINT_UNIQUE'
  ) {
    return errorResponse(c, 409, 'Conflict');
  }

  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return c.json({ error: message }, 500);
});

await loadRoutes(app, new URL('./routes', import.meta.url).pathname);

const info = { title: 'Blog API', version: '1.0.0' };
app.get('/openapi.json', (c) =>
  c.json(
    getOpenAPISpec(app, info, undefined, {
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
    }),
  ),
);
app.get('/docs', serveScalarUI({ specUrl: '/openapi.json' }));

process.on('SIGINT', async () => {
  await peta.destroy();
  process.exit(0);
});

const port = Number(process.env.PORT) || 4300;
Bun.serve({ fetch: app.fetch, port });
logger.info(`Server started at http://localhost:${port}`);
