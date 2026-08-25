/**
 * Reads a required environment variable, or throws a specific, readable
 * error naming exactly which one is missing.
 *
 * Without this, a missing env var reaches the Supabase client as `undefined`
 * (past the old `!` non-null assertions), and the client's internal fetch
 * throws a low-level, unrelated-looking error ("Failed to parse URL...")
 * with no indication of the actual cause. That's the difference between a
 * 30-second fix and a confusing debugging session.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in Vercel under ` +
        `Project Settings → Environment Variables (make sure it's enabled for the ` +
        `"Production" environment, not just Preview/Development), then redeploy.`
    );
  }
  return value;
}
