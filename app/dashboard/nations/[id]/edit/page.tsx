import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateDraftNation } from "../../actions";

type EditNationPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default function EditNationPage(props: EditNationPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold">Loading nation...</h1>
        </main>
      }
    >
      <EditNationForm {...props} />
    </Suspense>
  );
}

async function EditNationForm({ params, searchParams }: EditNationPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  const { data: nation, error: nationError } = await supabase
    .from("nations")
    .select(
      "id, name, short_description, long_description, capital, founded_date, website_url, status, visibility, creator_public, contact_public, fill_colour, border_colour, fill_opacity"
    )
    .eq("id", id)
    .eq("owner_id", profile.id)
    .single();

  if (nationError || !nation) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <Link href="/dashboard/nations" className="text-sm text-muted-foreground">
          ← Back to my nations
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Nation not found</h1>
        <p className="mt-3 text-muted-foreground">
          This draft does not exist, or you do not have permission to edit it.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/dashboard/nations" className="text-sm text-muted-foreground">
        ← Back to my nations
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Edit Nation</h1>

      <p className="mt-3 text-muted-foreground">
        Status: {nation.status}. Draft entries remain private at this stage.
      </p>

      {query?.error ? (
        <div className="mt-6 rounded-md border border-red-500 p-4 text-sm text-red-500">
          {query.error}
        </div>
      ) : null}

      <form action={updateDraftNation} className="mt-8 space-y-6">
        <input type="hidden" name="id" value={nation.id} />

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
            defaultValue={nation.name}
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
            defaultValue={nation.short_description}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2"
          />
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
            defaultValue={nation.long_description || ""}
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
              defaultValue={nation.capital || ""}
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
              defaultValue={nation.founded_date || ""}
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
            defaultValue={nation.website_url || ""}
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
              defaultValue={nation.fill_colour}
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
              defaultValue={nation.border_colour}
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
              defaultValue={nation.fill_opacity}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </div>

        <input type="hidden" name="visibility" value="private" />

        <label className="flex items-center gap-3 text-sm">
          <input
            name="creator_public"
            type="checkbox"
            defaultChecked={Boolean(nation.creator_public)}
          />
          Show my creator profile publicly later
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            name="contact_public"
            type="checkbox"
            defaultChecked={Boolean(nation.contact_public)}
          />
          Show public contact details later
        </label>

        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}