import Link from "next/link";
import { formatEnumLabel } from "@/features/candidates/constants";

type ActivityTimelineItem = {
  id: string;
  activity_type: string;
  summary: string;
  details: string | null;
  created_at: string;
  due_at?: string | null;
  profile:
    | { id: string; full_name: string }
    | { id: string; full_name: string }[]
    | null;
  deal?:
    | { id: string; title: string }
    | { id: string; title: string }[]
    | null;
};

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function ActivityTimeline({
  title,
  items,
  emptyMessage
}: {
  title: string;
  items: ActivityTimelineItem[];
  emptyMessage: string;
}) {
  return (
    <div className="crm-stat-card h-auto">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-sm">{items.length} items</span>
      </div>

      <div className="mt-6 space-y-8">
        {items.length === 0 ? (
          <div className="crm-empty-state py-12">
            <p className="text-sm text-white/40">{emptyMessage}</p>
          </div>
        ) : (
          items.map((activity) => {
            const profile = getSingleRelation(activity.profile);
            const deal = getSingleRelation(activity.deal);

            return (
              <div key={activity.id} className="border-l-2 border-white/5 pl-6 py-1 relative">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-[1px] bg-[#2383E2] shadow-[0_0_10px_rgba(35,131,226,0.5)]"></div>
                <p className="crm-label">
                  {formatEnumLabel(activity.activity_type)}
                </p>
                <h4 className="mt-1 font-bold text-white">{activity.summary}</h4>
                {activity.details ? (
                  <p className="mt-1 text-sm text-white/50 leading-relaxed"><span className="text-white/20 font-medium">Next step:</span> {activity.details}</p>
                ) : null}
                {activity.due_at ? (
                  <p className="mt-1 text-xs font-bold text-[#2383E2]">
                    Follow-up: {formatDate(activity.due_at)}
                  </p>
                ) : null}
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-2">
                  <span className="text-white/40">{profile?.full_name ?? "System"}</span>
                  {deal ? (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/10"></span>
                      <Link href={`/deals/${deal.id}`} className="hover:text-white transition-colors">
                        {deal.title}
                      </Link>
                    </>
                  ) : null}
                  <span className="w-1 h-1 rounded-full bg-white/10"></span>
                  {formatDate(activity.created_at)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
