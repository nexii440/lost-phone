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

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
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
    }
  );
}
