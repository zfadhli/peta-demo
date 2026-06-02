import type { ColumnShape, RelationMap } from 'peta-orm';
import { $t, ArkTypeSchemaConfig, BelongsTo, HasMany, ManyToMany, Model } from 'peta-orm';
import { Comment } from './comment';
import { Tag } from './tag';
import { User } from './user';

const t = $t({ schema: new ArkTypeSchemaConfig() });

const columns = {
  id: t.integer().primaryKey(),
  title: t.string(),
  slug: t.string().unique(),
  content: t.text(),
  excerpt: t.string().nullable(),
  published: t.boolean().default(false),
  userId: t.integer().references(() => User, ['id']),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
} satisfies ColumnShape;

export class Post extends Model {
  static override table = 'posts';
  static override columns = columns;
  static override relations: RelationMap = {
    author: new BelongsTo(() => User),
    comments: new HasMany(() => Comment, { foreignKey: 'postId' }),
    tags: new ManyToMany(() => Tag, {
      through: 'post_tags',
      foreignPivotKey: 'postId',
      relatedPivotKey: 'tagId',
    }),
  };
  static override $visible = [
    'id',
    'title',
    'slug',
    'content',
    'excerpt',
    'createdAt',
    'updatedAt',
    'author',
    'comments',
    'tags',
  ];
}

Post.registerTimestamps();

Post.on('beforeCreate', (post) => {
  if (!post.get('slug')) {
    const title = post.get('title') as string;
    post.set(
      'slug',
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    );
  }
});
