import { type } from 'arktype';
import { Hono } from 'hono';
import { route } from 'peta-hono';
import { forbidden, notFound } from '@/errors';
import { pick } from '@/helpers';
import { requireAuth } from '@/middleware/auth';
import { Post } from '@/models';
import type { AppEnv } from '@/types';
import { CreatePostBody, PostParams, UpdatePostBody } from './schema';

const posts = new Hono<AppEnv>();

posts.get(
  '/',
  route()
    .summary('List published posts')
    .paginated({ defaultLimit: 2 })
    .filter(
      'published',
      type("'0'|'1'").pipe((s) => Number(s)),
    )
    .sort(['title', 'createdAt', 'updatedAt'])
    .response(200, { description: 'Paginated posts' })
    .handle(async (c) => {
      const { page, limit, offset, sort, published } = c.req.valid('query');
      const sorts = sort ?? [];
      const query = Post.query()
        .where('published', '=', published ?? 1)
        .when(sorts.length > 0, (q) => {
          for (const s of sorts)
            q.orderBy(s.startsWith('-') ? s.slice(1) : s, s.startsWith('-') ? 'desc' : 'asc');
          return q;
        })
        .unless(sorts.length > 0, (q) => q.orderBy('createdAt', 'desc'));
      const [results, total] = await Promise.all([
        query.limit(limit).offset(offset).execute(),
        Post.query()
          .where('published', '=', published ?? 1)
          .count(),
      ]);
      return c.json({
        data: results.map((p) => pick(p, 'id', 'title', 'slug', 'excerpt', 'createdAt')),
        page,
        total,
      });
    }),
);

posts.get(
  '/:id',
  route()
    .summary('Get a post by ID')
    .params(PostParams)
    .include(['author', 'comments', 'tags'])
    .response(200, { description: 'Post with comments' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const { include = ['author', 'comments', 'tags'] } = c.req.valid('query');
      const query = Post.query()
        .where('published', '=', 1)
        .where('id', '=', id)
        .when(include.includes('author'), (q) => q.with('author'))
        .when(include.includes('comments'), (q) =>
          q.with({ comments: (qb) => qb.orderBy('createdAt', 'asc') }),
        )
        .when(include.includes('tags'), (q) => q.with('tags'));
      const post = await query.executeTakeFirst();
      if (!post) throw notFound();
      return c.json(post.$toJSON());
    }),
);

posts.post(
  '/',
  requireAuth,
  route()
    .summary('Create a post')
    .auth('bearerAuth')
    .requestBody(CreatePostBody)
    .response(201, { description: 'Post created' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const data = c.req.valid('json');
      const post = await Post.insert({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        published: true,
        userId: c.var.userId,
      });
      return c.json(post.$toJSON(), 201);
    }),
);

posts.put(
  '/:id',
  requireAuth,
  route()
    .summary('Update a post')
    .auth('bearerAuth')
    .params(PostParams)
    .requestBody(UpdatePostBody)
    .response(200, { description: 'Post updated' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your post' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.find(id);
      if (!post) throw notFound();
      if (post.get('userId') !== c.var.userId) throw forbidden();
      const data = c.req.valid('json');
      const updated = await Post.update(id, {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || null,
      });
      return c.json(updated.$toJSON());
    }),
);

posts.delete(
  '/:id',
  requireAuth,
  route()
    .summary('Delete a post')
    .auth('bearerAuth')
    .params(PostParams)
    .response(200, { description: 'Post deleted' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your post' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.find(id);
      if (!post) throw notFound();
      if (post.get('userId') !== c.var.userId) throw forbidden();
      await Post.delete(id);
      return c.json({ ok: true });
    }),
);

export default posts;
