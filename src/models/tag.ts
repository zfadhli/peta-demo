import type { ColumnShape } from 'peta-orm';
import { $t, ArkTypeSchemaConfig, Model } from 'peta-orm';

const t = $t({ schema: new ArkTypeSchemaConfig() });

const columns = {
  id: t.integer().primaryKey(),
  name: t.string(),
  slug: t.string().unique(),
  ...t.timestamps(),
} satisfies ColumnShape;

export class Tag extends Model {
  static override table = 'tags';
  static override columns = columns;
  static override $visible = ['id', 'name', 'slug'];
}

Tag.registerTimestamps();
