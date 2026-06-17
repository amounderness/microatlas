import Link from "next/link";

import { Button } from "@/components/ui/button";

const profileItems = [
  {
    title: "Who you are",
    body: "A short public description and flag.",
  },
  {
    title: "Where you claim",
    body: "A mapped, symbolic, historical, or territorial claim.",
  },
  {
    title: "Where to find you",
    body: "Links to your website, wiki, Discord, forum, archive, or social pages.",
  },
  {
    title: "Checked before publication",
    body: "Listings are reviewed before appearing in the public atlas.",
  },
];

const whyItems = [
  {
    title: "Find nations",
    body: "Browse public listings and claims without needing to know where each community already gathers.",
  },
  {
    title: "Follow their links",
    body: "Use each profile to visit the nation's own website, wiki, Discord, forum, archive, or social pages.",
  },
  {
    title: "Keep a public record",
    body: "Give serious projects a simple place to explain who they are and where people can find them.",
  },
];

const workflowItems = [
  {
    title: "Create a listing",
    body: "Add a short description, flag, key details, and links.",
  },
  {
    title: "Add a claim",
    body: "Show a mapped territory, symbolic claim, historical claim, or other relevant location.",
  },
  {
    title: "Submit for review",
    body: "Listings are checked before publication so the atlas stays useful, safe, and readable.",
  },
];

const boundaryItems = [
  {
    title: "Not a recognition authority",
    body: "MicroAtlas records self-declared information. It does not decide sovereignty, legitimacy, or legal status.",
  },
  {
    title: "Not a ranking system",
    body: "There are no leaderboards, prestige scores, claim rankings, or public competition mechanics.",
  },
  {
    title: "Not a diplomacy simulator",
    body: "No wars, alliance mechanics, recognition games, or conflict systems are part of the beta.",
  },
];

const futureItems = [
  {
    title: "Search and filters",
    body: "Find nations by name, region, claim type, status, or activity.",
  },
  {
    title: "Richer profiles",
    body: "Add more detail about institutions, founding dates, archives, government structures, and public links.",
  },
  {
    title: "Better routes into communities",
    body: "Make it easier for visitors to find official websites, Discord servers, forums, social pages, and contact routes.",
  },
  {
    title: "Updates and corrections",
    body: "Let listings improve over time without turning the atlas into an unmoderated free-for-all.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.25fr_0.75fr] md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Closed beta · Map and directory
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Explore the micronational world.
            </h1>

            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              MicroAtlas is a map and directory for micronations,
              self-declared states, and experimental projects. It helps
              visitors find nations, explore mapped claims, and follow projects
              back to their own websites and communities.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              If you run a serious micronation, MicroAtlas gives you a simple
              public listing: a profile, a flag, a mapped or symbolic claim,
              and links to where your community already lives.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/atlas">Browse the atlas</Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href="/auth/sign-up">Request beta access</Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-lg border bg-muted/30 p-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              What your listing can show
            </p>

            <div className="mt-6 rounded-lg border bg-background p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Example atlas record</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Public profile · Mapped claim · External links
                  </p>
                </div>
                <div className="h-10 w-14 rounded-sm border bg-secondary" />
              </div>
              <div className="mt-5 h-24 rounded-md border bg-muted/40 p-3">
                <div className="h-full rounded-sm border border-dashed border-muted-foreground/40 bg-background/70" />
              </div>
            </div>

            <dl className="mt-6 space-y-5">
              {profileItems.map((item) => (
                <div key={item.title}>
                  <dt className="text-sm font-medium">{item.title}</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Why MicroAtlas exists
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Micronations are scattered across the web; MicroAtlas helps people find them.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Some live on wikis. Some live on Discord. Some have old websites,
            forum threads, Reddit posts, social pages, or archived documents.
            MicroAtlas is being built to connect those fragments into one
            browsable map and directory.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {whyItems.map((item) => (
            <article key={item.title} className="rounded-lg border p-6">
              <h3 className="text-lg font-medium">{item.title}</h3>
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
              How listings work
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Add the basics, show the claim, then submit for review.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {workflowItems.map((item, index) => (
              <article
                key={item.title}
                className="rounded-lg border bg-background p-6"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            A gateway, not a replacement
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Your community stays yours.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            MicroAtlas points people to the places where micronations already
            live. It is not trying to replace MicroWiki, MicroForum, Discord
            servers, Reddit communities, independent websites, or national
            forums.
          </p>
        </div>

        <div className="grid gap-4">
          {boundaryItems.map((item) => (
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
              What comes next
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Starting small, then growing carefully.
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              These are planned directions for the platform as the beta
              develops, not promises that every feature is available today.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {futureItems.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border bg-background p-5"
              >
                <h3 className="text-base font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/roadmap">View the roadmap</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
        <article>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Privacy and moderation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Public listings. Private accounts.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            MicroAtlas is built to help people find public listings, but
            account details stay private by default. Drafts, rejected
            submissions, and hidden entries do not appear in the public atlas.
            Listings are reviewed before publication.
          </p>
        </article>

        <article className="rounded-lg border p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Closed beta
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Help build a better map of the micronational world.
          </h2>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            MicroAtlas is preparing for closed beta with a small group of
            serious micronationalists, researchers, and community participants.
            Beta feedback will shape the submission process, profile structure, 
            moderation rules, and future discovery tools.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/auth/sign-up">Request beta access</Link>
            </Button>
          </div>
        </article>
      </section>
    </main>
  );
}
