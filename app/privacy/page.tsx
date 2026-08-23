import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink-950">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-500">Phase 1</p>

      <div className="prose-none mt-10 space-y-8 text-ink-800">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">
            What we collect
          </h2>
          <p className="mt-2 leading-relaxed">
            When you file a report at <code className="font-mono text-sm">/report</code>, we
            store the device details you provide (type, brand, model, color), where and when
            it was last seen, a description, your contact email, an optional phone number,
            and an optional photo. We don&apos;t collect anything beyond what&apos;s on that
            form.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">How it&apos;s used</h2>
          <p className="mt-2 leading-relaxed">
            Your report is stored so the case can be looked up by its case ID. Anyone with
            the case ID can see the device details, last-seen location, and status — never
            your email, phone number, or the free-text description. Only signed-in
            administrators on the allowlist can see the full report, including contact
            details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Where it&apos;s stored</h2>
          <p className="mt-2 leading-relaxed">
            Reports and photos are stored with Supabase (Postgres and file storage). Photos
            live in a private storage bucket that isn&apos;t publicly accessible; only
            server-side code with administrator privileges can read it. Every database table
            has row-level security enabled, so access is enforced at the database layer, not
            just in the app.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">What we don&apos;t do</h2>
          <p className="mt-2 leading-relaxed">
            We never sell or share report data with third parties. We never access Find My
            iPhone, Find My Device, or any carrier location data — we have no technical means
            to, and this registry doesn&apos;t attempt to.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Retention</h2>
          <p className="mt-2 leading-relaxed">
            A case stays on record until it&apos;s marked found or closed, and for a
            reasonable period afterward so the case history remains checkable. If you&apos;d
            like your report removed, contact the site administrator.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Questions</h2>
          <p className="mt-2 leading-relaxed">
            This policy describes Phase 1 functionality only and should be reviewed before a
            production launch. For questions or data requests, contact the site
            administrator directly.
          </p>
        </section>
      </div>
    </div>
  );
}
