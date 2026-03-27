import { FileText, Plus } from "lucide-react";

type CampaignAboutProps = {
  campaign: {
    owner: { full_name: string; email: string | null } | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    notes: string | null;
  };
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function CampaignAbout({ campaign }: CampaignAboutProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="border border-white/5 bg-white/[0.02] p-6 rounded-xl backdrop-blur-sm shadow-sm">
        <h3 className="text-lg font-bold text-white tracking-tight">Overview & Strategy</h3>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">Owner</dt>
            <dd className="mt-1 text-sm font-semibold text-white/90">{campaign.owner?.full_name || campaign.owner?.email || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">Status</dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-lg bg-[#2383E2]/10 border border-[#2383E2]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#2383E2]">
                {campaign.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">Start Date</dt>
            <dd className="mt-1 text-sm font-semibold text-white/90">{formatDate(campaign.start_date)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">End Date</dt>
            <dd className="mt-1 text-sm font-semibold text-white/90">{formatDate(campaign.end_date)}</dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-8 border-t border-white/5 pt-8 lg:grid-cols-2">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-white/90 tracking-tight">
              <FileText className="h-4 w-4 text-white/20" />
              Description
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {campaign.description ?? "No description added yet."}
            </p>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-white/90 tracking-tight">
              <Plus className="h-4 w-4 text-white/20" />
              Notes
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {campaign.notes ?? "No notes added yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
