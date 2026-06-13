export default function AccountRestrictedNotice() {
  return (
    <section className="rounded-lg border border-red-500 p-6">
      <h1 className="text-2xl font-semibold text-red-500">
        Account restricted
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        This account has been restricted by the MicroAtlas moderation team.
        You can still browse public pages, but you cannot create, edit, submit,
        upload, report, or manage nation entries.
      </p>

      <p className="mt-3 text-sm text-muted-foreground">
        If this appears to be an error, contact the site administrator.
      </p>
    </section>
  );
}