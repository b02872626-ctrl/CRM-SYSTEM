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
      <div className="border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Overview & Strategy</h3>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Owner</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{campaign.owner?.full_name ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {campaign.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(campaign.start_date)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(campaign.end_date)}</dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-8 border-t border-slate-100 pt-8 lg:grid-cols-2">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-slate-400" />
              Description
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {campaign.description ?? "No description added yet."}
            </p>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Plus className="h-4 w-4 text-slate-400" />
              Notes
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {campaign.notes ?? "No notes added yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
