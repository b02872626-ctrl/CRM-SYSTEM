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
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <span className="text-sm text-slate-500">{items.length} items</span>
      </div>

      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
            {emptyMessage}
          </div>
        ) : (
          items.map((activity) => {
            const profile = getSingleRelation(activity.profile);
            const deal = getSingleRelation(activity.deal);

            return (
              <div key={activity.id} className="border-l-2 border-slate-200 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {formatEnumLabel(activity.activity_type)}
                </p>
                <h4 className="mt-1 font-medium text-slate-950">{activity.summary}</h4>
                {activity.details ? (
                  <p className="mt-1 text-sm text-slate-600">Next step: {activity.details}</p>
                ) : null}
                {activity.due_at ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Follow-up date: {formatDate(activity.due_at)}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  {profile?.full_name ?? "System"}
                  {deal ? (
                    <>
                      {" | "}
                      <Link href={`/deals/${deal.id}`} className="hover:underline">
                        {deal.title}
                      </Link>
                    </>
                  ) : null}
                  {" | "}
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
