import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('bookmarks')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.autoIncrement().primaryKey())
    .addColumn('userId', 'integer', (c) => c.notNull().references('users.id'))
    .addColumn('postId', 'integer', (c) => c.notNull().references('posts.id'))
    .addColumn('createdAt', 'text', (c) => c.notNull())
    .addColumn('updatedAt', 'text', (c) => c.notNull())
    .addUniqueConstraint('bookmarks_user_post_unique', ['userId', 'postId'])
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
  await db.schema.dropTable('bookmarks').ifExists().execute();
  await db.schema.dropTable('post_tags').ifExists().execute();
}
