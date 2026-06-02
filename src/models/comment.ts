import type { ColumnShape, RelationMap } from 'peta-orm';
import { $t, ArkTypeSchemaConfig, BelongsTo, Model } from 'peta-orm';
import { Post } from './post';
import { User } from './user';

const t = $t({ schema: new ArkTypeSchemaConfig() });

const columns = {
  id: t.integer().primaryKey(),
  content: t.text(),
  postId: t.integer(),
  userId: t.integer(),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
} satisfies ColumnShape;

export class Comment extends Model {
  static override table = 'comments';
  static override columns = columns;
  static override relations: RelationMap = {
    post: new BelongsTo(() => Post),
    author: new BelongsTo(() => User),
  };
  static override $visible = ['id', 'content', 'userId', 'postId', 'createdAt'];
}

Comment.registerTimestamps();
