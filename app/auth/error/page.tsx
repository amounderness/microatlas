// /error/page.tsx

import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params?.error;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        The authentication link could not be completed. This may happen if the
        link has expired, has already been used, or is missing required
        information.
      </p>

      {errorMessage ? (
        <p className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">
          Error details: {errorMessage}
        </p>
      ) : (
        <p className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">
          Error details: No specific error was provided.
        </p>
      )}

      <Link
        href="/auth/login"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Return to login
      </Link>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Authentication link failed
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">
                  Loading error details...
                </p>
              }
            >
              <ErrorContent searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}