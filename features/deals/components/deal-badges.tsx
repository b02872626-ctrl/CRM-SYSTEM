import { cn } from "@/lib/utils";
import { formatEnumLabel } from "@/features/deals/constants";

const urgencyClasses: Record<string, string> = {
  low: "border-white/5 bg-white/5 text-white/40",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-500",
  critical: "border-red-500/20 bg-red-500/10 text-red-500"
};

const stageClasses: Record<string, string> = {
  new: "border-white/5 bg-white/5 text-white/40",
  qualified: "border-[#2383E2]/20 bg-[#2383E2]/10 text-[#2383E2]",
  proposal: "border-indigo-500/20 bg-indigo-500/10 text-indigo-500",
  negotiation: "border-violet-500/20 bg-violet-500/10 text-violet-500",
  won: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  lost: "border-rose-500/20 bg-rose-500/10 text-rose-500"
};

export function DealUrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
        urgencyClasses[urgency] ?? "border-white/5 bg-white/5 text-white/40"
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
        "inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
        stageClasses[stage] ?? "border-white/5 bg-white/5 text-white/40"
      )}
    >
      {formatEnumLabel(stage)}
    </span>
  );
}
