import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.autoIncrement().primaryKey())
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('email', 'text', (c) => c.notNull().unique())
    .addColumn('password', 'text', (c) => c.notNull())
    .addColumn('createdAt', 'text', (c) => c.notNull())
    .addColumn('updatedAt', 'text', (c) => c.notNull())
    .execute();

  await db.schema
    .createTable('posts')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.autoIncrement().primaryKey())
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('slug', 'text', (c) => c.notNull().unique())
    .addColumn('content', 'text', (c) => c.notNull())
    .addColumn('excerpt', 'text')
    .addColumn('published', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('userId', 'integer', (c) => c.notNull().references('users.id'))
    .addColumn('createdAt', 'text', (c) => c.notNull())
    .addColumn('updatedAt', 'text', (c) => c.notNull())
    .execute();

  await db.schema
    .createTable('comments')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.autoIncrement().primaryKey())
    .addColumn('content', 'text', (c) => c.notNull())
    .addColumn('postId', 'integer', (c) => c.notNull().references('posts.id'))
    .addColumn('userId', 'integer', (c) => c.notNull().references('users.id'))
    .addColumn('createdAt', 'text', (c) => c.notNull())
    .addColumn('updatedAt', 'text', (c) => c.notNull())
    .execute();

  await db.schema
    .createTable('tags')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.autoIncrement().primaryKey())
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('slug', 'text', (c) => c.notNull().unique())
    .addColumn('createdAt', 'text', (c) => c.notNull())
    .addColumn('updatedAt', 'text', (c) => c.notNull())
    .execute();

  await db.schema
    .createTable('post_tags')
    .ifNotExists()
    .addColumn('postId', 'integer', (c) => c.notNull().references('posts.id'))
    .addColumn('tagId', 'integer', (c) => c.notNull().references('tags.id'))
    .addPrimaryKeyConstraint('post_tags_pk', ['postId', 'tagId'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('post_tags').ifExists().execute();
  await db.schema.dropTable('tags').ifExists().execute();
  await db.schema.dropTable('comments').ifExists().execute();
  await db.schema.dropTable('posts').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();
}
