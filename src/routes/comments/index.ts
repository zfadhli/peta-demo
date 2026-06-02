import { Hono } from 'hono';
import { route } from 'peta-hono';
import { forbidden, notFound } from '@/errors';
import { requireAuth } from '@/middleware/auth';
import { Comment, Post } from '@/models';
import type { AppEnv } from '@/types';
import { CommentParams, CreateCommentBody } from './schema';

const comments = new Hono<AppEnv>();

comments.post(
  '/',
  requireAuth,
  route()
    .summary('Comment on a post')
    .auth('bearerAuth')
    .requestBody(CreateCommentBody)
    .response(201, { description: 'Comment created' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const { postId, content } = c.req.valid('json');
      const post = await Post.find(postId);
      if (!post) throw notFound();
      const comment = await Comment.insert({ content, postId, userId: c.var.userId });
      return c.json(comment.$toJSON(), 201);
    }),
);

comments.delete(
  '/:id',
  requireAuth,
  route()
    .summary('Delete a comment')
    .auth('bearerAuth')
    .params(CommentParams)
    .response(200, { description: 'Comment deleted' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your comment' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const comment = await Comment.find(id);
      if (!comment) throw notFound();
      if (comment.get('userId') !== c.var.userId) throw forbidden();
      await Comment.delete(id);
      return c.json({ ok: true });
    }),
);

export default comments;
