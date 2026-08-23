"use client";

import { useFormState } from "react-dom";
import { submitReport, type ReportFormState } from "./actions";
import { DEVICE_TYPES } from "@/lib/validation";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: ReportFormState = {};

export default function ReportPage() {
  const [state, formAction] = useFormState(submitReport, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
        File a report
      </span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-950">
        Report a lost device
      </h1>
      <p className="mt-3 text-ink-700">
        Takes about two minutes. You&apos;ll get a case ID at the end — save it, it&apos;s the
        only way to check status later.
      </p>

      <form action={formAction} className="mt-10 space-y-6">
        {state.error && (
          <div className="rounded-md border border-flare-600/30 bg-flare-500/10 px-4 py-3 text-sm text-flare-600">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="device_type" className="block text-sm font-medium text-ink-950">
            Device type
          </label>
          <select
            id="device_type"
            name="device_type"
            defaultValue="Phone"
            required
            className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 focus:border-flare-500 focus:outline-none"
          >
            {DEVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-ink-950">
              Brand
            </label>
            <input
              id="brand"
              name="brand"
              required
              placeholder="Apple, Samsung, Google…"
              className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
            />
            {errors.brand && <p className="mt-1 text-sm text-flare-600">{errors.brand}</p>}
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-ink-950">
              Model <span className="text-ink-500">(optional)</span>
            </label>
            <input
              id="model"
              name="model"
              placeholder="iPhone 15 Pro…"
              className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-ink-950">
            Color <span className="text-ink-500">(optional)</span>
          </label>
          <input
            id="color"
            name="color"
            placeholder="Midnight blue…"
            className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="last_seen_location"
              className="block text-sm font-medium text-ink-950"
            >
              Last seen location
            </label>
            <input
              id="last_seen_location"
              name="last_seen_location"
              required
              placeholder="Coffee shop on 5th & Main…"
              className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
            />
            {errors.last_seen_location && (
              <p className="mt-1 text-sm text-flare-600">{errors.last_seen_location}</p>
            )}
          </div>
          <div>
            <label htmlFor="last_seen_date" className="block text-sm font-medium text-ink-950">
              Last seen date
            </label>
            <input
              id="last_seen_date"
              name="last_seen_date"
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
              className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 focus:border-flare-500 focus:outline-none"
            />
            {errors.last_seen_date && (
              <p className="mt-1 text-sm text-flare-600">{errors.last_seen_date}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink-950">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Distinguishing features, case, lock screen, circumstances it went missing…"
            className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-flare-600">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-ink-950">
              Contact email
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-flare-600">{errors.contact_email}</p>
            )}
            <p className="mt-1 text-xs text-ink-500">
              Never shown publicly — only visible to registry admins.
            </p>
          </div>
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-ink-950">
              Phone <span className="text-ink-500">(optional)</span>
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              placeholder="(555) 555-0100"
              className="mt-1.5 w-full rounded-md border border-ink-800/20 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-flare-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-ink-950">
            Photo <span className="text-ink-500">(optional, under 5MB)</span>
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="mt-1.5 w-full text-sm text-ink-700 file:mr-4 file:rounded-md file:border file:border-ink-800/20 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-ink-800 hover:file:border-ink-800/40"
          />
          {errors.photo && <p className="mt-1 text-sm text-flare-600">{errors.photo}</p>}
        </div>

        <label className="flex items-start gap-3 text-sm text-ink-700">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-4 w-4 rounded border-ink-800/30 text-flare-500 focus:ring-flare-500"
          />
          I understand this is a case registry, not a live tracking service, and I
          won&apos;t receive real-time location data.
        </label>

        <SubmitButton pendingLabel="Filing report…">Submit report</SubmitButton>
      </form>
    </div>
  );
}
