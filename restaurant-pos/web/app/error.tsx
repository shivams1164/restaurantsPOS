// FILE: web/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Keeps error visible in console for diagnostics.
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-app-background p-6">
        <div className="max-w-md rounded-xl border border-app-border bg-white p-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-neutral-600">{error.message}</p>
          <Button className="mt-5" onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
