import { type } from 'arktype';

export const CommentParams = type({ id: 'string' });

export const CreateCommentBody = type({ postId: 'number', content: 'string>0' });
