// FILE: web/app/(auth)/login/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LoginError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-app-border bg-white p-6 text-center">
      <h2 className="text-lg font-semibold text-neutral-900">Login failed unexpectedly</h2>
      <p className="mt-2 text-sm text-neutral-600">{error.message}</p>
      <Button className="mt-4" onClick={reset}>Try again</Button>
    </div>
  );
}
