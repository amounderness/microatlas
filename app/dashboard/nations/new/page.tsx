import Link from "next/link";

import { createDraftNation } from "../actions";

type NewNationPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewNationPage({
  searchParams,
}: NewNationPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard/nations" className="text-sm text-muted-foreground">
        ← Back to my nations
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Create Nation</h1>

      <p className="mt-3 text-muted-foreground">
        This creates a private draft. Map drawing, flag upload, and submission
        for review will be added in later phases.
      </p>

      {params?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {params.error}
        </div>
      ) : null}

      <form action={createDraftNation} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nation name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="short_description"
            className="block text-sm font-medium"
          >
            Short description
          </label>
          <textarea
            id="short_description"
            name="short_description"
            required
            minLength={10}
            maxLength={280}
            rows={3}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            This will eventually appear in map popups.
          </p>
        </div>

        <div>
          <label
            htmlFor="long_description"
            className="block text-sm font-medium"
          >
            Long description
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows={6}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="capital" className="block text-sm font-medium">
              Capital or headquarters
            </label>
            <input
              id="capital"
              name="capital"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="founded_date" className="block text-sm font-medium">
              Founded date
            </label>
            <input
              id="founded_date"
              name="founded_date"
              placeholder="e.g. 18 June 2019"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website_url" className="block text-sm font-medium">
            Website
          </label>
          <input
            id="website_url"
            name="website_url"
            type="url"
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="fill_colour" className="block text-sm font-medium">
              Fill colour
            </label>
            <input
              id="fill_colour"
              name="fill_colour"
              type="color"
              defaultValue="#2563eb"
              className="mt-2 h-10 w-full rounded-md border bg-background px-2 py-1"
            />
          </div>

          <div>
            <label
              htmlFor="border_colour"
              className="block text-sm font-medium"
            >
              Border colour
            </label>
            <input
              id="border_colour"
              name="border_colour"
              type="color"
              defaultValue="#1e3a8a"
              className="mt-2 h-10 w-full rounded-md border bg-background px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="fill_opacity" className="block text-sm font-medium">
              Fill opacity
            </label>
            <input
              id="fill_opacity"
              name="fill_opacity"
              type="number"
              min="0"
              max="1"
              step="0.05"
              defaultValue="0.35"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <input type="hidden" name="visibility" value="private" />

        <label className="flex items-center gap-3 text-sm">
          <input name="creator_public" type="checkbox" />
          Show my creator profile publicly later
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input name="contact_public" type="checkbox" />
          Show public contact details later
        </label>

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Save draft nation
        </button>
      </form>
    </main>
  );
}