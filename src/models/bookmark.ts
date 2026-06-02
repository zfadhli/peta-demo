import type { ColumnShape, RelationMap } from 'peta-orm';
import { $t, ArkTypeSchemaConfig, BelongsTo, Model } from 'peta-orm';
import { Post } from './post';
import { User } from './user';

const t = $t({ schema: new ArkTypeSchemaConfig() });

const columns = {
  id: t.integer().primaryKey(),
  userId: t.integer().references(() => User, ['id']),
  postId: t.integer().references(() => Post, ['id']),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
} satisfies ColumnShape;

export class Bookmark extends Model {
  static override table = 'bookmarks';
  static override columns = columns;
  static override relations: RelationMap = {
    user: new BelongsTo(() => User),
    post: new BelongsTo(() => Post),
  };
  static override $visible = ['id', 'postId', 'userId', 'createdAt'];
}

Bookmark.registerTimestamps();
