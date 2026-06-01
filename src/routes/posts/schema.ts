import { type } from 'arktype';

export const PostParams = type({ id: 'string' });

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
