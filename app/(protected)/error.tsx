"use client";

type ProtectedErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProtectedErrorPage({ error, reset }: ProtectedErrorPageProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          Something went wrong
        </p>
        <h2 className="mt-2 text-xl font-semibold text-red-950">
          This page could not load cleanly.
        </h2>
        <p className="mt-1 text-sm text-red-800">
          {error.message || "A server error interrupted the request."}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center justify-center rounded-md bg-red-900 px-4 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
