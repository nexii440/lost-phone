import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="border-b border-ink-800/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
              Admin
            </p>
            {user?.email && <p className="text-sm text-ink-800">{user.email}</p>}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-ink-800/20 px-3 py-1.5 text-sm text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
