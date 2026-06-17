import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const termsSections = [
  {
    title: "MicroAtlas is a registry and atlas",
    body: "MicroAtlas is a public atlas and registry for micronations, self-declared states, and experimental civic projects. It is intended for discovery, archival, and research context, not for legal adjudication or political recognition.",
  },
  {
    title: "No sovereignty recognition",
    body: "Inclusion on MicroAtlas does not mean MicroAtlas recognises sovereignty, statehood, jurisdiction, territorial ownership, independence, legal personality, or diplomatic status.",
  },
  {
    title: "No endorsement",
    body: "Approved publication means an entry has passed moderation standards for public display. It does not mean MicroAtlas endorses the project, its claims, its politics, its links, its conduct, or its interpretation of history.",
  },
  {
    title: "Submissions are self-declared",
    body: "Users are responsible for the information they submit. Nation descriptions, map claims, flags, links, dates, and related details are self-declared and may be incomplete, contested, symbolic, historical, or disputed.",
  },
  {
    title: "Admin review and moderation",
    body: "MicroAtlas may review, approve, reject, request changes to, hide, restore, or remove entries. Moderation decisions may consider safety, clarity, privacy, spam risk, impersonation, legal risk, and whether the entry fits the purpose of the beta.",
  },
  {
    title: "Prohibited content",
    body: "Users must not submit spam, harassment, threats, hateful or extremist content, impersonation, private personal information without consent, pornographic or shock content, malware, suspicious links, illegal material, or deliberately disruptive claims.",
  },
  {
    title: "Reports and removals",
    body: "Visitors and users may report entries for moderator review. MicroAtlas may remove or hide content after a report, after internal review, or when an entry creates privacy, safety, impersonation, abuse, or reliability concerns.",
  },
  {
    title: "Closed beta status",
    body: "MicroAtlas is in closed beta. Access may be limited, features may be incomplete, moderation policies may be refined, and some workflows may change as the product is tested with early users.",
  },
  {
    title: "Features may change",
    body: "MicroAtlas may add, change, pause, or remove features during development. Roadmap items are not guarantees, and beta availability does not promise permanent access to any specific feature or listing format.",
  },
];

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Plain-language terms for MicroAtlas closed beta submissions, moderation, public listings, and roadmap expectations.",
};

export default function TermsPage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_0.65fr] md:items-end md:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Terms
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Terms for a careful closed beta.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              These terms describe how MicroAtlas treats submissions, public
              listings, moderation, and product changes during the beta.
            </p>
          </div>

          <aside className="rounded-lg border bg-muted/30 p-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Short version
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              MicroAtlas records self-declared information. Publication does
              not imply legal recognition, endorsement, or settlement of
              disputed claims.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {termsSections.map((section) => (
            <article key={section.title} className="rounded-lg border p-6">
              <h2 className="text-xl font-medium">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Related information
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Read the privacy notes and roadmap too.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button asChild>
              <Link href="/privacy">Read privacy</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/roadmap">View roadmap</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
