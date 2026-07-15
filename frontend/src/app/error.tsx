"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-slate-900">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-slate-600">
        An unexpected error occurred while rendering this page. Please try
        again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}
