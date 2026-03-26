import Link from "next/link";
import { getDashboardData } from "@/features/dashboard/queries";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  const recentRecords = dashboardData.recentRecords;

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Dashboard</p>
          <h2 className="crm-page-title">Team snapshot</h2>
          <p className="crm-page-copy">
            Lightweight counts for the day and a short recent update list.
          </p>
        </div>
      </div>

      <div className="crm-stat-grid">
        <div className="crm-stat-card">
          <p className="text-sm font-medium text-slate-500">Follow-ups due today</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {dashboardData.dueTodayCount}
          </p>
        </div>
        <div className="crm-stat-card">
          <p className="text-sm font-medium text-slate-500">Overdue follow-ups</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {dashboardData.overdueCount}
          </p>
        </div>
        <div className="crm-stat-card">
          <p className="text-sm font-medium text-slate-500">Recent updates loaded</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{recentRecords.length}</p>
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4">
          <h3 className="px-4 py-3 text-base font-semibold text-slate-950">Recently updated</h3>
          <span className="px-4 py-3 text-sm text-slate-500">{recentRecords.length}</span>
        </div>
        <div>
          {recentRecords.length === 0 ? (
            <div className="border-t border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
              No recent record updates.
            </div>
          ) : (
            recentRecords.map((record) => (
              <div
                key={`${record.type}-${record.id}`}
                className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {record.type}
                  </p>
                  <Link href={record.href} className="block truncate font-medium text-slate-950 hover:underline">
                    {record.label}
                  </Link>
                </div>
                <p className="shrink-0 text-xs text-slate-500">{formatDate(record.updated_at)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
