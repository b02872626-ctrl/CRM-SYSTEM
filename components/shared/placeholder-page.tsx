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
      <div className="crm-stat-card h-auto p-10">
        <div className="space-y-3">
          <p className="crm-label">
            Overview
          </p>
          <h2 className="crm-page-title">{title}</h2>
          <p className="crm-page-copy">{description}</p>
        </div>
      </div>

      <div className="flex min-h-[420px] items-center justify-center rounded-sm border-2 border-dashed border-white/5 bg-white/[0.02] px-6 py-12">
        <div className="max-w-md text-center">
          <h3 className="text-xl font-bold text-white tracking-tight">{emptyTitle}</h3>
          <p className="mt-4 text-sm leading-relaxed text-white/40">{emptyMessage}</p>
        </div>
      </div>
    </section>
  );
}
