import { cn } from "@/lib/utils";
import { formatEnumLabel } from "@/features/deals/constants";

const urgencyClasses: Record<string, string> = {
  low: "border-slate-300 bg-slate-50 text-slate-700",
  medium: "border-amber-300 bg-amber-50 text-amber-800",
  high: "border-orange-300 bg-orange-50 text-orange-800",
  critical: "border-red-300 bg-red-50 text-red-800"
};

const stageClasses: Record<string, string> = {
  new: "border-slate-300 bg-slate-50 text-slate-700",
  qualified: "border-blue-300 bg-blue-50 text-blue-800",
  proposal: "border-indigo-300 bg-indigo-50 text-indigo-800",
  negotiation: "border-violet-300 bg-violet-50 text-violet-800",
  won: "border-emerald-300 bg-emerald-50 text-emerald-800",
  lost: "border-rose-300 bg-rose-50 text-rose-800"
};

export function DealUrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        urgencyClasses[urgency] ?? "border-slate-300 bg-slate-50 text-slate-700"
      )}
    >
      {formatEnumLabel(urgency)}
    </span>
  );
}

export function DealStageBadge({ stage }: { stage: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        stageClasses[stage] ?? "border-slate-300 bg-slate-50 text-slate-700"
      )}
    >
      {formatEnumLabel(stage)}
    </span>
  );
}
