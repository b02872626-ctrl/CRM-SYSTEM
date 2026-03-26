type PlaceholderPageProps = {
  title: string;
  description: string;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function PlaceholderPage({
  title,
  description,
  emptyTitle = `No ${title.toLowerCase()} yet`,
  emptyMessage = "This area is ready for the first feature layer."
}: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Overview
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="max-w-3xl text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 shadow-sm">
        <div className="max-w-md text-center">
          <h3 className="text-lg font-semibold text-slate-950">{emptyTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{emptyMessage}</p>
        </div>
      </div>
    </section>
  );
}
