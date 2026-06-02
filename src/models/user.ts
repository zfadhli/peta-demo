import type { ColumnShape, RelationMap } from 'peta-orm';
import { $t, ArkTypeSchemaConfig, HasMany, Model } from 'peta-orm';
import { Bookmark } from './bookmark';

const t = $t({ schema: new ArkTypeSchemaConfig() });

const columns = {
  id: t.integer().primaryKey(),
  name: t.string(),
  email: t.string().unique(),
  password: t.string(),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
} satisfies ColumnShape;

export class User extends Model {
  static override table = 'users';
  static override columns = columns;
  static override relations: RelationMap = {
    bookmarks: new HasMany(() => Bookmark),
  };
  static override $visible = ['id', 'name'];
}

User.registerTimestamps();
