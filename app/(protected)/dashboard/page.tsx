import Link from "next/link";
import { getDashboardData } from "@/features/dashboard/queries";
import { getCurrentProfile } from "@/lib/auth";

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
  const [dashboardData, profile] = await Promise.all([
    getDashboardData(),
    getCurrentProfile()
  ]);
  
  const recentRecords = dashboardData.recentRecords;
  const isAdmin = (profile?.role as string) === "admin";

  return (
    <section className="crm-page">
      {isAdmin ? (
        <div className="crm-page-header">
          <div>
            <p className="crm-page-kicker">Dashboard</p>
            <h2 className="crm-page-title">Team snapshot</h2>
            <p className="crm-page-copy">
              Lightweight counts for the day and a short recent update list.
            </p>
          </div>
        </div>
      ) : (
        <div className="crm-page-header">
          <div>
            <p className="crm-page-kicker">Dashboard</p>
            <h2 className="crm-page-title">Welcome back</h2>
            <p className="crm-page-copy">
              Here are the latest updates across the CRM.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isAdmin && (
          <div className="crm-stat-grid font-medium text-white/40">
            <div className="crm-stat-card">
              <p className="crm-label">Follow-ups due today</p>
              <p className="crm-page-title">{dashboardData.dueTodayCount}</p>
            </div>
            <div className="crm-stat-card">
              <p className="crm-label">Overdue follow-ups</p>
              <p className="crm-page-title">{dashboardData.overdueCount}</p>
            </div>
            <div className="crm-stat-card">
              <p className="crm-label">Recent updates loaded</p>
              <p className="crm-page-title">{recentRecords.length}</p>
            </div>
          </div>
        )}

        <div className="crm-table-shell">
          <div className="flex items-center justify-between gap-4 bg-white/[0.03] border-b border-white/5">
            <h3 className="px-6 py-4 text-sm font-bold text-white uppercase tracking-[0.2em]">Recently updated</h3>
            <span className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">
              {recentRecords.length}
            </span>
          </div>
          <div>
            {recentRecords.length === 0 ? (
              <div className="crm-empty-state py-12 border-none">
                <p className="text-sm text-white/40">No recent record updates.</p>
              </div>
            ) : (
              recentRecords.map((record) => (
                <div
                  key={`${record.type}-${record.id}`}
                  className="flex items-center justify-between gap-4 border-t border-white/5 px-6 py-4 group relative transition-colors hover:bg-white/[0.03] first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="crm-label mb-1">{record.type}</p>
                    <Link
                      href={record.href}
                      className="block truncate font-bold text-white group-hover:text-[#2383E2] transition-colors after:absolute after:inset-0 after:z-10"
                    >
                      {record.label}
                    </Link>
                  </div>
                  <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/20 relative z-20 pointer-events-none">
                    {formatDate(record.updated_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
