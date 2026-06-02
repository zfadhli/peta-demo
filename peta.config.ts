import { defineConfig } from 'peta-orm/migrator';

export default defineConfig({
  migrationsDir: './migrations',
  models: './src/models/*.ts',
});
