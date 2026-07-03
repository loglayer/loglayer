/**
 * Derive metric tags from a logger context object using an allowlist.
 *
 * For each allowlisted key whose context value is a scalar (string/number/
 * boolean), produces a `key:value` tag string. Missing keys, null/undefined,
 * objects, and arrays are skipped.
 *
 * @param context - The resolved logger context
 * @param keys - The allowlist of context keys to promote
 * @returns Tag strings in the form `key:value`
 */
export function deriveContextTags(context: Record<string, any> | undefined, keys: string[]): string[] {
  const tags: string[] = [];
  if (!context) {
    return tags;
  }
  for (const key of keys) {
    const value = context[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      tags.push(`${key}:${value}`);
    }
  }
  return tags;
}
