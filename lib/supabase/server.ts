import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

/**
 * Anon-key Supabase client wired to the Next.js cookie store, for use in
 * Server Components, Server Actions, and Route Handlers. RLS applies based
 * on whoever is signed in (or anon, if no one is) — same as middleware.ts.
 *
 * Cookie writes only actually persist when called from a Server Action or
 * Route Handler; Next.js forbids setting cookies during a Server Component
 * render, so those calls are swallowed here (session refresh in that case
 * is handled by middleware.ts on the next request, per Supabase's docs).
 */
export function createClient() {
  const cookieStore = cookies();
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  try {
    return createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component render — safe to ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from a Server Component render — safe to ignore.
          }
        },
      },
    });
  } catch (err) {
    // requireEnv() above only catches an EMPTY/missing variable — it
    // returns the string as-is if one is set, even if malformed.
    // createServerClient() validates the URL itself and throws
    // synchronously, at construction time, before any call made on the
    // resulting client is ever reached. This is a genuine configuration
    // problem (not a "no session" case), so it's rethrown clearly rather
    // than swallowed — callers that need a graceful, non-throwing outcome
    // (like a login form) are responsible for catching this themselves.
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to initialize the Supabase client: ${message}. Check NEXT_PUBLIC_SUPABASE_URL ` +
        `in Vercel (Project Settings → Environment Variables, Production scope) — it must be ` +
        `the full URL including the "https://" scheme, e.g. https://your-project-ref.supabase.co, ` +
        `with no extra whitespace or quotes.`
    );
  }
}
