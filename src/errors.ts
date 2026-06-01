import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export function errorResponse(c: Context, status: ContentfulStatusCode, message: string) {
  return c.json({ error: message } as const, status);
}

export function notFound(message = 'Not found'): never {
  throw new HTTPException(404, { message });
}

export function forbidden(message = 'Forbidden'): never {
  throw new HTTPException(403, { message });
}

export function unauthorized(message = 'Not authenticated'): never {
  throw new HTTPException(401, { message });
}

export function conflict(message = 'Conflict'): never {
  throw new HTTPException(409, { message });
}
