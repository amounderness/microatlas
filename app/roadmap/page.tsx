import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const currentMvpItems = [
  {
    title: "Public atlas",
    body: "Approved nations appear on a public map and directory for visitors to browse.",
  },
  {
    title: "Nation profiles",
    body: "Each approved entry can show a short description, flag, public links, and mapped claim context.",
  },
  {
    title: "Mapped submissions",
    body: "Beta users can prepare a draft nation and add one primary claim for review.",
  },
  {
    title: "Moderated publication",
    body: "Submissions are reviewed before they become visible in the public atlas.",
  },
];

const nearTermItems = [
  {
    title: "Clearer submission flow",
    body: "Improve field guidance, validation, and review feedback so serious submissions are easier to complete.",
  },
  {
    title: "Search and filters",
    body: "Help visitors find entries by name, region, claim type, status, or other simple discovery signals.",
  },
  {
    title: "Richer public profiles",
    body: "Add careful space for more context, public links, dates, institutions, and community information.",
  },
  {
    title: "Moderation polish",
    body: "Improve reporting, review notes, status visibility, and the admin tools needed for a small beta.",
  },
];

const laterItems = [
  {
    title: "Optional contact routes",
    body: "Explore ways to contact listed projects without exposing private account email addresses.",
  },
  {
    title: "Update history",
    body: "Let approved entries communicate significant profile changes or corrections over time.",
  },
  {
    title: "External community directory",
    body: "Make official websites, forums, wikis, Discord servers, archives, and social pages easier to find.",
  },
  {
    title: "Carefully limited community features",
    body: "Consider lightweight follow or watch tools only after the registry and moderation model are reliable.",
  },
];

const notPlannedItems = [
  "Public Chat",
  "Direct messages",
  "Wars or conflicts",
  "Public Rankings",
  "Leaderboards",
  "Recognition mechanics",
  "Internal Alliance Systems",
  "Public Comments",
];

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "MicroAtlas roadmap for MVP v1.0 closed beta, near-term improvements, later possibilities, and features not planned for v1.0.",
};

export default function RoadmapPage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_0.65fr] md:items-end md:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Development roadmap
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Building the atlas before the social layer.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              MicroAtlas is currently focused on becoming a serious, moderated
              map and directory for micronations, self-declared states, and
              experimental civic projects. This roadmap explains what is in
              scope, what may come later, and what is intentionally excluded
              from v1.0.
            </p>
          </div>

          <aside className="rounded-lg border bg-muted/30 p-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Current status
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              MVP v1.0 closed beta
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The first release is intentionally narrow: account-based
              submissions, mapped claims, public profiles, review, reporting,
              and core discovery.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Last updated: June 2026. This roadmap may change as beta feedback reveals real product needs.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Now: MVP v1.0
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            The beta proves the registry model first.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            v1.0 is about whether MicroAtlas can collect, review, and publish
            useful atlas entries without exposing private information or
            encouraging low-quality submissions.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {currentMvpItems.map((item) => (
            <article key={item.title} className="rounded-lg border p-5">
              <h3 className="text-base font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Next: Near-term improvements
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Improvements after the first beta feedback.
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              These are likely directions, not launch promises. The order will
              depend on tester feedback, moderation needs, and the stability of
              the core submission workflow.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {nearTermItems.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border bg-background p-6"
              >
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Later: Possible future features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Possible only after the foundation is stable.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Later features should support discovery and public records without
            turning MicroAtlas into a general social network, roleplay game, or
            conflict simulator.
          </p>
        </div>

        <div className="grid gap-4">
          {laterItems.map((item) => (
            <article key={item.title} className="rounded-lg border p-5">
              <h3 className="text-base font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Not planned for v1.0
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Some features are deliberately outside the first release.
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              These exclusions are product decisions, not permanent judgments.
              The closed beta needs to prove privacy, moderation, mapping, and
              publication before adding features that create heavier social or
              political dynamics.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {notPlannedItems.map((item) => (
              <div
                key={item}
                className="rounded-lg border bg-background px-4 py-3 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
        <article>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Roadmap principle
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Useful, moderated, and honest about limits.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            MicroAtlas should become a reliable public record before it becomes
            anything more complex. The roadmap may change as beta testers find
            real friction in the product.
          </p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Items listed as later possibilities are not promises. They are directions
            under consideration once the core atlas, moderation, and privacy model are stable.
          </p>
        </article>

        <article className="rounded-lg border p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Closed beta
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Help test the core atlas workflow.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Beta feedback will shape the submission process, map drawing,
            moderation rules, public profiles, and discovery tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/sign-up">Request beta access</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/atlas">Browse the atlas</Link>
            </Button>
          </div>
        </article>
      </section>
    </main>
  );
}
