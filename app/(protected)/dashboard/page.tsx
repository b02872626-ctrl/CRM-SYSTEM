import { Suspense } from "react";
import Link from "next/link";
import { getDashboardData } from "@/features/dashboard/queries";
import { StatGridSkeleton, TableSkeleton } from "@/components/ui/table-skeleton";

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

async function DashboardStats() {
  const dashboardData = await getDashboardData();
  
  return (
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
        <p className="mt-2 text-3xl font-semibold text-slate-950">{dashboardData.recentRecords.length}</p>
      </div>
    </div>
  );
}

async function DashboardRecentUpdates() {
  const dashboardData = await getDashboardData();
  const recentRecords = dashboardData.recentRecords;

  return (
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
              className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 group relative transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {record.type}
                </p>
                <Link 
                  href={record.href} 
                  className="block truncate font-medium text-slate-950 group-hover:underline after:absolute after:inset-0 after:z-10"
                >
                  {record.label}
                </Link>
              </div>
              <p className="shrink-0 text-xs text-slate-500 relative z-20 pointer-events-none">{formatDate(record.updated_at)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
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

      <div className="space-y-6">
        <Suspense fallback={<StatGridSkeleton />}>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={<TableSkeleton rows={3} />}>
          <DashboardRecentUpdates />
        </Suspense>
      </div>
    </section>
  );
}
