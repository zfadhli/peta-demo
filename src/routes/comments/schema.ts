import { type } from 'arktype';

const coerceId = type('string').pipe((s) => Number(s));

export const CommentParams = type({ id: coerceId });

export const CreateCommentBody = type({ postId: 'number', content: 'string>0' });
