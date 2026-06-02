import { type } from 'arktype';

const coerceId = type('string').pipe((s) => Number(s));

export const PostParams = type({ id: coerceId });

export const CreatePostBody = type({
  title: 'string>0',
  slug: 'string>0',
  content: 'string>0',
  'excerpt?': 'string | null',
});

export const UpdatePostBody = type({
  title: 'string>0',
  content: 'string>0',
  'excerpt?': 'string | null',
});
