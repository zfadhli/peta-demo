import { Hono } from 'hono';
import { route } from 'peta-hono';
import { forbidden, notFound } from '@/errors';
import { requireAuth } from '@/middleware/auth';
import { Bookmark, Post } from '@/models';
import type { AppEnv } from '@/types';
import { BookmarkParams, CreateBookmarkBody } from './schema';

const bookmarks = new Hono<AppEnv>();

bookmarks.get(
  '/',
  requireAuth,
  route()
    .summary('List my bookmarks')
    .auth('bearerAuth')
    .response(200, { description: 'List of bookmarks with post details' })
    .handle(async (c) => {
      const results = await Bookmark.query()
        .where('userId', '=', c.var.userId)
        .with('post')
        .orderBy('createdAt', 'desc')
        .collect();
      return c.json(results.toJSON());
    }),
);

bookmarks.post(
  '/',
  requireAuth,
  route()
    .summary('Bookmark a post')
    .auth('bearerAuth')
    .requestBody(CreateBookmarkBody)
    .response(201, { description: 'Bookmark created' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const { postId } = c.req.valid('json');
      const post = await Post.find(postId);
      if (!post) throw notFound();
      const bookmark = await Bookmark.insert({ postId, userId: c.var.userId });
      return c.json(bookmark.toJSON(), 201);
    }),
);

bookmarks.delete(
  '/:id',
  requireAuth,
  route()
    .summary('Remove a bookmark')
    .auth('bearerAuth')
    .params(BookmarkParams)
    .response(200, { description: 'Bookmark removed' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your bookmark' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const bookmark = await Bookmark.find(id);
      if (!bookmark) throw notFound();
      if (bookmark.get('userId') !== c.var.userId) throw forbidden();
      await Bookmark.delete(id);
      return c.json({ ok: true });
    }),
);

export default bookmarks;
