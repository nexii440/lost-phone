import { createBrowserClient } from "@supabase/ssr";

/**
 * Anon-key Supabase client for use inside Client Components. RLS applies in
 * full — this client can never see more than an anonymous visitor can.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
