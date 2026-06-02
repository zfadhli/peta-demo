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
