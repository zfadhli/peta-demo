import { Hono } from 'hono';
import { route } from 'peta-hono';
import { notFound } from '@/errors';
import { requireAuth } from '@/middleware/auth';
import { Tag } from '@/models';
import type { AppEnv } from '@/types';
import { CreateTagBody, TagParams, UpdateTagBody } from './schema';

const tags = new Hono<AppEnv>();

tags.get(
  '/',
  route()
    .summary('List all tags')
    .response(200, { description: 'All tags' })
    .handle(async (c) => {
      const results = await Tag.query().orderBy('name', 'asc').collect();
      return c.json(results.toJSON());
    }),
);

tags.get(
  '/:id',
  route()
    .summary('Get a tag by ID')
    .params(TagParams)
    .response(200, { description: 'Tag details' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const tag = await Tag.find(id);
      if (!tag) throw notFound();
      return c.json(tag.toJSON());
    }),
);

tags.post(
  '/',
  requireAuth,
  route()
    .summary('Create a tag')
    .auth('bearerAuth')
    .requestBody(CreateTagBody)
    .response(201, { description: 'Tag created' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const { name, slug } = c.req.valid('json');
      const tag = await Tag.insert({ name, slug });
      return c.json(tag.toJSON(), 201);
    }),
);

tags.put(
  '/:id',
  requireAuth,
  route()
    .summary('Update a tag')
    .auth('bearerAuth')
    .params(TagParams)
    .requestBody(UpdateTagBody)
    .response(200, { description: 'Tag updated' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const tag = await Tag.find(id);
      if (!tag) throw notFound();
      const { name, slug } = c.req.valid('json');
      const updated = await Tag.update(id, { name, slug });
      return c.json(updated.toJSON());
    }),
);

tags.delete(
  '/:id',
  requireAuth,
  route()
    .summary('Delete a tag')
    .auth('bearerAuth')
    .params(TagParams)
    .response(200, { description: 'Tag deleted' })
    .response(401, { description: 'Not authenticated' })
    .handle(async (c) => {
      const { id } = c.req.valid('param');
      const tag = await Tag.find(id);
      if (!tag) throw notFound();
      await Tag.delete(id);
      return c.json({ ok: true });
    }),
);

export default tags;
