import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800/10 bg-paper-50">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-ink-600">
        <p className="max-w-2xl">
          FindMyLost is a public case registry, not a tracking service. We never access Find
          My iPhone, Find My Device, or any carrier location data, and we never bypass a
          device&apos;s security.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-ink-950">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-ink-950">
            Terms of Use
          </Link>
          <Link href="/case" className="hover:text-ink-950">
            Check a case
          </Link>
        </div>
      </div>
    </footer>
  );
}
