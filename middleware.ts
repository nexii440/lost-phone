import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Middleware runs on the Edge runtime, before Next.js has a route or an
  // error boundary to render — there is no error.tsx that can catch a
  // throw here. An unguarded exception in this function used to surface as
  // a bare, contentless 500 with zero diagnostic info. Everything below is
  // wrapped so that, on any unexpected failure, we log the real cause (full
  // detail lands in Vercel's function logs) and let the request through
  // rather than crash the whole edge function. app/admin/layout.tsx's
  // requireAdmin() is the authoritative check that actually protects
  // /admin — this middleware is a fast-path redirect for a snappier UX on
  // the common case, not the only line of defense.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "middleware: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "— check Vercel Project Settings → Environment Variables (Production scope)."
    );
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    // getUser() is wrapped at this exact call site — not just relying on
    // the outer try/catch — because Supabase's client can signal "no
    // active session" (AuthSessionMissingError) either as a returned
    // `error` field OR, in some runtimes, as a thrown exception. Either
    // form means the same ordinary thing here: no one is signed in. Both
    // are treated identically as user = null, never as a failure.
    let user = null;
    try {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      user = fetchedUser;
    } catch {
      user = null;
    }

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isLoginRoute = request.nextUrl.pathname === "/login";

    if (isAdminRoute && !user) {
      const redirectUrl = new URL("/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAdminRoute && user) {
      // Confirm the logged-in user is actually on the admins allowlist.
      // (RLS also enforces this on every query — this is a fast-path UX check.)
      const { data: adminRow, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error("middleware: admins lookup failed:", adminError.message);
        // Don't guess at authorization when the check itself failed — let
        // the request through and let requireAdmin() in the layout make
        // the real, guarded decision.
        return response;
      }

      if (!adminRow) {
        try {
          await supabase.auth.signOut();
        } catch {
          // Best-effort — still redirect below even if sign-out itself fails.
        }
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("error", "not_authorized");
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (isLoginRoute && user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  } catch (err) {
    console.error("middleware: unexpected error, letting request through:", err);
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
