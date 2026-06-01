import { Hono } from 'hono';
import { route } from 'peta-hono';
import { peta } from '../../db';
import { requireAuth } from '../../middleware/auth';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import type { AppEnv } from '../../types';
import { CreatePostBody, PostParams, UpdatePostBody } from './schema';

const posts = new Hono<AppEnv>();

posts.get(
  '/',
  route()
    .summary('List published posts')
    .paginated({ defaultLimit: 2 })
    .response(200, { description: 'Paginated posts' })
    .handle(async (c) => {
      const { page, limit, offset } = c.req.valid('query');
      const results = await Post.query()
        .where('published', '=', 1)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();
      const total = await peta.kysely
        .selectFrom('posts')
        .where('published', '=', 1)
        .select(peta.kysely.fn.countAll<number>().as('count'))
        .executeTakeFirst();
      return c.json({
        data: results.map((p) => ({
          id: p.get('id'),
          title: p.get('title'),
          slug: p.get('slug'),
          excerpt: p.get('excerpt'),
          createdAt: p.get('createdAt'),
        })),
        page,
        total: Number(total?.count || 0),
      });
    }),
);

posts.get(
  '/:id',
  route()
    .summary('Get a post by ID')
    .params(PostParams)
    .response(200, { description: 'Post with comments' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.query()
        .where('published', '=', 1)
        .where('id', '=', Number(id))
        .executeTakeFirst();
      if (!post) return c.json({ error: 'Not found' }, 404);
      const author = await User.find(post.get('userId') as number);
      const comments = await peta.kysely
        .selectFrom('comments')
        .selectAll()
        .where('postId', '=', Number(id))
        .orderBy('createdAt', 'asc')
        .execute();
      return c.json({
        id: post.get('id'),
        title: post.get('title'),
        slug: post.get('slug'),
        content: post.get('content'),
        excerpt: post.get('excerpt'),
        createdAt: post.get('createdAt'),
        updatedAt: post.get('updatedAt'),
        author: author ? { id: author.get('id'), name: author.get('name') } : null,
        comments: comments.map((c) => ({
          id: c.id,
          content: c.content,
          userId: c.userId,
          createdAt: c.createdAt,
        })),
      });
    }),
);

posts.post(
  '/',
  requireAuth,
  route()
    .summary('Create a post')
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
      return c.json({ id: post.get('id'), title: post.get('title'), slug: post.get('slug') }, 201);
    }),
);

posts.put(
  '/:id',
  requireAuth,
  route()
    .summary('Update a post')
    .params(PostParams)
    .requestBody(UpdatePostBody)
    .response(200, { description: 'Post updated' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your post' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.find(Number(id));
      if (!post) return c.json({ error: 'Not found' }, 404);
      if (post.get('userId') !== c.var.userId) return c.json({ error: 'Forbidden' }, 403);
      const data = c.req.valid('json');
      const updated = await Post.update(Number(id), {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || null,
      });
      return c.json({ id: updated.get('id'), title: updated.get('title') });
    }),
);

posts.delete(
  '/:id',
  requireAuth,
  route()
    .summary('Delete a post')
    .params(PostParams)
    .response(200, { description: 'Post deleted' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your post' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.find(Number(id));
      if (!post) return c.json({ error: 'Not found' }, 404);
      if (post.get('userId') !== c.var.userId) return c.json({ error: 'Forbidden' }, 403);
      await Post.delete(Number(id));
      return c.json({ ok: true });
    }),
);

export default posts;
