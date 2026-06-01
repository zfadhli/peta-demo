import { Hono } from 'hono';
import { route } from 'peta-hono';
import { requireAuth } from '../../middleware/auth';
import { Comment } from '../../models/comment';
import { Post } from '../../models/post';
import type { AppEnv } from '../../types';
import { CommentParams, CreateCommentBody } from './schema';

const comments = new Hono<AppEnv>();

comments.post(
  '/',
  requireAuth,
  route()
    .summary('Comment on a post')
    .requestBody(CreateCommentBody)
    .response(201, { description: 'Comment created' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const { postId, content } = c.req.valid('json');
      const post = await Post.find(postId);
      if (!post) return c.json({ error: 'Post not found' }, 404);
      const comment = await Comment.insert({ content, postId, userId: c.var.userId });
      return c.json(
        {
          id: comment.get('id'),
          content: comment.get('content'),
          userId: comment.get('userId'),
          postId: comment.get('postId'),
          createdAt: comment.get('createdAt'),
        },
        201,
      );
    }),
);

comments.delete(
  '/:id',
  requireAuth,
  route()
    .summary('Delete a comment')
    .params(CommentParams)
    .response(200, { description: 'Comment deleted' })
    .response(401, { description: 'Not authenticated' })
    .response(403, { description: 'Not your comment' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const comment = await Comment.find(Number(id));
      if (!comment) return c.json({ error: 'Not found' }, 404);
      if (comment.get('userId') !== c.var.userId) return c.json({ error: 'Forbidden' }, 403);
      await Comment.delete(Number(id));
      return c.json({ ok: true });
    }),
);

export default comments;
