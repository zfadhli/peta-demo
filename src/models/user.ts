import type { ColumnShape } from 'peta-orm';
import { $t, ArkTypeSchemaConfig, Model } from 'peta-orm';

const t = $t({ schema: new ArkTypeSchemaConfig() });

const columns = {
  id: t.integer().primaryKey(),
  name: t.string(),
  email: t.string(),
  password: t.string(),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
} satisfies ColumnShape;

export class User extends Model {
  static override table = 'users';
  static override columns = columns;
}

User.registerTimestamps();
