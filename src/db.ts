import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { BunSqliteDialect } from 'kysely-bun-sqlite';
import { Peta } from 'peta-orm';

const dbPath = process.env.DB_PATH || './data/blog.db';
const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'));
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(dbPath, { create: true });
sqlite.exec('PRAGMA journal_mode = WAL');
sqlite.exec('PRAGMA foreign_keys = ON');

export const peta = new Peta({
  dialect: new BunSqliteDialect({ database: sqlite }),
});

export async function runMigrations() {
  const db = peta.kysely;

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
}
