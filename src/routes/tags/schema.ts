import { type } from 'arktype';

const coerceId = type('string').pipe((s) => Number(s));

export const TagParams = type({ id: coerceId });

export const CreateTagBody = type({
  name: 'string>0',
  slug: 'string>0',
});

export const UpdateTagBody = type({
  name: 'string>0',
  slug: 'string>0',
});
