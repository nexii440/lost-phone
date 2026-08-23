import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-ink-800/10 bg-paper-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink-950">
            FindMyLost
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-600 group-hover:text-flare-600">
            Case Registry
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/report" className="text-ink-800 hover:text-ink-950">
            Report a device
          </Link>
          <Link href="/case" className="text-ink-800 hover:text-ink-950">
            Check a case
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-ink-800/20 px-3 py-1.5 text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
