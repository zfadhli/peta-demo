import { Hono } from 'hono';
import { route } from 'peta-hono';
import { forbidden, notFound } from '@/errors';
import { requireAuth } from '@/middleware/auth';
import { Comment, Post, User } from '@/models';
import type { AppEnv } from '@/types';
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
      const total = await Post.query().where('published', '=', 1).count();
      return c.json({
        data: results.map((p) => ({
          id: p.get('id'),
          title: p.get('title'),
          slug: p.get('slug'),
          excerpt: p.get('excerpt'),
          createdAt: p.get('createdAt'),
        })),
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
    .response(200, { description: 'Post with comments' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.query()
        .where('published', '=', 1)
        .where('id', '=', Number(id))
        .executeTakeFirst();
      if (!post) throw notFound();
      const author = await User.find(post.get('userId') as number);
      const comments = await Comment.query()
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
          id: c.get('id'),
          content: c.get('content'),
          userId: c.get('userId'),
          createdAt: c.get('createdAt'),
        })),
      });
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
      return c.json({ id: post.get('id'), title: post.get('title'), slug: post.get('slug') }, 201);
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
      const post = await Post.find(Number(id));
      if (!post) throw notFound();
      if (post.get('userId') !== c.var.userId) throw forbidden();
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
    .auth('bearerAuth')
    .params(PostParams)
    .response(200, { description: 'Post deleted' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your post' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const post = await Post.find(Number(id));
      if (!post) throw notFound();
      if (post.get('userId') !== c.var.userId) throw forbidden();
      await Post.delete(Number(id));
      return c.json({ ok: true });
    }),
);

export default posts;
