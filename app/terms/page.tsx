import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink-950">Terms of Use</h1>
      <p className="mt-2 text-sm text-ink-500">Phase 1</p>

      <div className="mt-10 space-y-8 text-ink-800">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">
            What this service is
          </h2>
          <p className="mt-2 leading-relaxed">
            FindMyLost is a public case registry for lost devices. It lets you file a report,
            receive a case ID, and lets anyone with that ID check the case&apos;s status. It
            is not a tracking service, not law enforcement, and not affiliated with Apple,
            Google, or any carrier.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Acceptable use</h2>
          <p className="mt-2 leading-relaxed">
            Don&apos;t file false reports. Don&apos;t use contact details found through this
            service to harass, defraud, or contact anyone for a purpose other than resolving
            a case in good faith. We may close or remove a case that violates these terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">No guarantee of recovery</h2>
          <p className="mt-2 leading-relaxed">
            Filing a report does not guarantee your device will be found, and a case&apos;s
            status reflects only what has been reported to the registry. If your device
            contains sensitive data, also take the steps your device manufacturer or carrier
            recommends (remote lock, account sign-out, carrier block).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">No warranty</h2>
          <p className="mt-2 leading-relaxed">
            The service is provided as-is, without warranty of any kind, during this Phase 1
            build. We&apos;re not liable for losses arising from its use, to the fullest
            extent the law allows.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Changes</h2>
          <p className="mt-2 leading-relaxed">
            These terms describe Phase 1 functionality only and should be reviewed by counsel
            before a production launch. We may update them as the service changes.
          </p>
        </section>
      </div>
    </div>
  );
}
