import { useMemo } from "react";

import { submitNationReport } from "@/app/nations/[slug]/actions";

type NationReportFormProps = {
  nationId: string;
  slug: string;
};

export default function NationReportForm({
  nationId,
  slug,
}: NationReportFormProps) {
  const loadedAt = useMemo(() => Date.now(), []);

  return (
    <form action={submitNationReport} className="mt-5 space-y-5">
      <input type="hidden" name="target_id" value={nationId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="loaded_at" value={loadedAt} />

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="report-reason" className="block text-sm font-medium">
          Reason
        </label>

        <select
          id="report-reason"
          name="reason"
          required
          className="mt-2 w-full rounded-md border bg-background px-3 py-2"
        >
          <option value="">Select a reason</option>
          <option value="spam">Spam</option>
          <option value="abuse_or_harassment">Abuse or harassment</option>
          <option value="privacy_or_personal_information">
            Privacy or personal information
          </option>
          <option value="extremist_or_hateful_content">
            Extremist or hateful content
          </option>
          <option value="impersonation">Impersonation</option>
          <option value="pornographic_or_shock_content">
            Pornographic or shock content
          </option>
          <option value="malware_or_suspicious_link">
            Malware or suspicious link
          </option>
          <option value="disruptive_or_excessive_claim">
            Disruptive or excessive claim
          </option>
          <option value="low_effort_or_nonsense">
            Low-effort or nonsense entry
          </option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="report-details" className="block text-sm font-medium">
          Details
        </label>

        <textarea
          id="report-details"
          name="details"
          rows={5}
          className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          placeholder="Add any context that may help moderators review this report."
        />
      </div>

      <button
        type="submit"
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        Submit report
      </button>
    </form>
  );
}