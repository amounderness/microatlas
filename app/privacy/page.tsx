import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const privacySections = [
  {
    title: "What MicroAtlas collects",
    body: [
      "MicroAtlas collects the information needed to run a closed beta atlas and registry. This includes account details, profile information, nation submissions, map claims, flag uploads, reports, moderation records, and basic technical information handled by hosting and infrastructure providers.",
      "The beta is intentionally limited. MicroAtlas does not need private legal identity documents for ordinary account use, and public listing fields are designed for project information rather than personal information.",
    ],
  },
  {
    title: "Account emails",
    body: [
      "Account email addresses are used for login, verification, account security, moderation contact, and important service messages.",
      "Account emails are not shown on public atlas pages by default. Public contact options are separate from account email addresses and require a deliberate choice from the user.",
    ],
  },
  {
    title: "Profiles",
    body: [
      "Profiles include display names, usernames, short bios, and public contact choices when those details are provided. Profile information helps moderators understand who is submitting entries and helps visitors identify the creator of an approved listing when the user chooses to show that information.",
      "Profile fields are intended for public-facing project identity, not sensitive personal information.",
    ],
  },
  {
    title: "Nation submissions",
    body: [
      "Nation submissions include a nation name, descriptions, public links, dates, claim context, visual styling choices, and other details provided by the submitter when those fields are completed.",
      "Draft, submitted, rejected, hidden, or needs-changes entries are not treated as public atlas content. Approved public entries are visible to visitors and can be indexed by external services.",
    ],
  },
  {
    title: "Map claims",
    body: [
      "Map claims include drawn geometry, claim type, area labels, colours, opacity settings, and related descriptive context when those details are provided.",
      "Claims are self-declared and are stored so MicroAtlas can display approved entries on the public atlas. Displaying a claim does not imply legal recognition, ownership, jurisdiction, or endorsement.",
    ],
  },
  {
    title: "Flag uploads",
    body: [
      "Flag uploads include the image file, storage path, alt text, upload status, and moderation status.",
      "Uploaded files are reviewed before public display. Users must only upload images they have the right to submit and must not upload private, abusive, illegal, or unsafe material.",
    ],
  },
  {
    title: "Reports",
    body: [
      "Reports include the reported entry, selected reason, optional details, reporter account information if logged in, timestamps, and moderator review notes.",
      "Reports are used for moderation and safety. They are not intended as public discussion threads.",
    ],
  },
  {
    title: "Public vs private information",
    body: [
      "Public information includes approved nation profiles, approved flags, mapped claims, public links, and any public creator or contact details the user has chosen to share.",
      "Private information includes account emails, drafts, rejected submissions, hidden entries, internal moderation notes, and account-level safety information. MicroAtlas exposes only approved public data on public pages.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "MicroAtlas uses service providers to operate the beta, including Supabase for authentication, database, and storage; Vercel for hosting; Cloudflare for security or bot protection; and Resend for email delivery.",
      "These providers process technical data needed to deliver the service, such as IP addresses, device or browser information, logs, security signals, and email delivery metadata.",
    ],
  },
  {
    title: "User choices and contact",
    body: [
      "Users can choose what public links and public contact routes they add to a listing. Users can request correction, hiding, or removal of their own entries when appropriate.",
      "For privacy questions, beta access issues, or removal requests, contact the MicroAtlas operator through the official contact route provided during the beta.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Plain-language privacy information for MicroAtlas closed beta accounts, submissions, claims, uploads, reports, and public listings.",
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Privacy
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
            Privacy for a moderated public atlas.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            MicroAtlas is built around public listings and private accounts.
            This page explains the main kinds of information handled during the
            closed beta and how public visibility works.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {privacySections.map((section) => (
            <article key={section.title} className="rounded-lg border p-6">
              <h2 className="text-xl font-medium">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Beta note
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Privacy expectations will be refined during beta.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button asChild>
              <Link href="/faq">Read the FAQ</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/terms">Read the terms</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
