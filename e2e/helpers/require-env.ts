/** Returns the env var's value, or throws if it is missing or empty —
 * so callers get a `string`, not `string | undefined`. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env.e2e. Make sure it is set.`);
  }
  return value;
}
