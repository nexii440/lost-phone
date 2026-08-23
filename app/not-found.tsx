import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-start px-6 py-24">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
        404
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink-950">
        This page isn&apos;t on record.
      </h1>
      <p className="mt-3 max-w-md text-ink-700">
        The page you&apos;re looking for doesn&apos;t exist. If you&apos;re trying to check a
        case, you&apos;ll need its case ID.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-md bg-ink-950 px-5 py-2.5 text-sm font-medium text-paper-50 hover:bg-ink-900"
        >
          Go home
        </Link>
        <Link
          href="/case"
          className="rounded-md border border-ink-800/20 px-5 py-2.5 text-sm font-medium text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
        >
          Check a case
        </Link>
      </div>
    </div>
  );
}
