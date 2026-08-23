import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-800/10 bg-paper-50">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <span className="inline-block rounded border border-ink-800/15 bg-white px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] text-ink-600">
            Case Registry — Phase 1
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-950 sm:text-5xl">
            A public record for lost devices. Not a tracker.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
            File a report, get a case ID, and let anyone — you, a finder, a buyer checking a
            second-hand phone — look up its status. That&apos;s the whole service.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/report"
              className="rounded-md bg-ink-950 px-6 py-3 text-sm font-medium text-paper-50 hover:bg-ink-900"
            >
              Report a lost device
            </Link>
            <Link
              href="/case"
              className="rounded-md border border-ink-800/20 px-6 py-3 text-sm font-medium text-ink-800 hover:border-ink-800/40 hover:text-ink-950"
            >
              Check a case status
            </Link>
          </div>
        </div>
      </section>

      {/* What this is / isn't */}
      <section className="border-b border-ink-800/10">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:py-20">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-signal-found">
              What this is
            </h2>
            <ul className="mt-4 space-y-3 text-ink-800">
              <li>A public record that a device was reported lost, tied to a case ID.</li>
              <li>A status anyone can check — open, found, or closed — with no login.</li>
              <li>
                A paper trail useful to a finder, a buyer checking a used device, or the
                owner themselves.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-flare-600">
              What this isn&apos;t
            </h2>
            <ul className="mt-4 space-y-3 text-ink-800">
              <li>We never access Find My iPhone, Find My Device, or carrier location data.</li>
              <li>We never bypass activation lock, a carrier lock, or any device security.</li>
              <li>We never fabricate or promise real-time tracking results.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink-800/10 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold text-ink-950">How it works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            <li>
              <span className="font-mono text-sm text-ink-500">01</span>
              <p className="mt-2 font-medium text-ink-950">File a report</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                Describe the device and where it was last seen. Takes about two minutes.
              </p>
            </li>
            <li>
              <span className="font-mono text-sm text-ink-500">02</span>
              <p className="mt-2 font-medium text-ink-950">Get a case ID</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                A short, unique ID like{" "}
                <span className="font-mono text-ink-950">FML-7K9QXN</span> — save it, it&apos;s
                the only way to check status later.
              </p>
            </li>
            <li>
              <span className="font-mono text-sm text-ink-500">03</span>
              <p className="mt-2 font-medium text-ink-950">Anyone can check status</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                No account needed. The case ID alone shows status — nothing else.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Quick lookup */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="rounded-xl border border-ink-800/10 bg-ink-950 px-6 py-10 sm:px-10">
            <h2 className="font-display text-xl font-semibold text-paper-50">
              Already have a case ID?
            </h2>
            <form action="/case" method="get" className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                name="id"
                placeholder="FML-7K9QXN"
                className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-paper-50 placeholder:text-white/40 focus:border-flare-500 focus:outline-none sm:max-w-xs"
              />
              <button
                type="submit"
                className="rounded-md bg-flare-500 px-6 py-2.5 text-sm font-medium text-ink-950 hover:bg-flare-600"
              >
                Check status
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
