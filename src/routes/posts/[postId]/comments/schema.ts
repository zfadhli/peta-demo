import { type } from 'arktype';

const coerceId = type('string').pipe((s) => Number(s));

export const PostIdParams = type({ postId: coerceId });

export const CommentParams = type({ postId: coerceId, id: coerceId });

export const CreateCommentBody = type({
  content: 'string>0',
});
