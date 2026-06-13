import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          MicroAtlas
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          A public atlas for micronations and self-declared civic projects.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground">
          MicroAtlas is a moderated public registry for micronations,
          self-declared states, experimental civic projects, and related
          territorial claims. Entries are submitted by verified users and
          reviewed before publication.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/atlas"
            className="rounded-md border px-5 py-3 text-sm font-medium"
          >
            Browse the atlas
          </Link>

          <Link
            href="/auth/login"
            className="rounded-md border px-5 py-3 text-sm font-medium"
          >
            Sign in
          </Link>

          <Link
            href="/auth/sign-up"
            className="rounded-md border px-5 py-3 text-sm font-medium"
          >
            Create account
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <article className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Moderated registry</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Public entries are reviewed before publication. Drafts,
            rejected entries, and hidden entries remain non-public.
          </p>
        </article>

        <article className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Mapped claims</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Approved entries can appear on a public map with basic profile
            information, a flag, and a self-declared claim boundary.
          </p>
        </article>

        <article className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Closed beta notice</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            MicroAtlas is in MVP development. Functionality and presentation
            may change during testing.
          </p>
        </article>
      </section>
    </main>
  );
}
