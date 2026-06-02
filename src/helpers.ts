export function pick<T extends { get(key: string): unknown }, K extends string>(
  model: T,
  ...keys: K[]
): Record<K, unknown> {
  const obj = {} as Record<K, unknown>;
  for (const key of keys) obj[key] = model.get(key);
  return obj;
}
