"use client";

type ProtectedErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProtectedErrorPage({ error, reset }: ProtectedErrorPageProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
          Something went wrong
        </p>
        <h2 className="mt-2 text-xl font-bold text-white tracking-tight">
          This page could not load cleanly.
        </h2>
        <p className="mt-1 text-sm text-white/60">
          {error.message || "A server error interrupted the request."}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="crm-primary-button bg-red-600 hover:bg-red-500 border-none"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
