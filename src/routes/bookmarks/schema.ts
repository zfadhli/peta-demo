import { type } from 'arktype';

const coerceId = type('string').pipe((s) => Number(s));

export const BookmarkParams = type({ id: coerceId });

export const CreateBookmarkBody = type({
  postId: 'number',
});
