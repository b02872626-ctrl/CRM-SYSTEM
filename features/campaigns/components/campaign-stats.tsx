import { Users, TrendingUp, DollarSign } from "lucide-react";

type CampaignStatsProps = {
  metrics: {
    linkedCompanyCount: number;
    qualifiedCompanyCount: number;
    dealsCreatedCount: number;
  };
};

export function CampaignStats({ metrics }: CampaignStatsProps) {
  return (
    <div className="crm-stat-grid mb-8">
      <div className="crm-stat-card border-l-4 border-l-blue-500">
        <p className="text-sm font-medium text-slate-500">Leads (Linked)</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.linkedCompanyCount}</p>
      </div>
      <div className="crm-stat-card border-l-4 border-l-emerald-500">
        <p className="text-sm font-medium text-slate-500">Qualified leads</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.qualifiedCompanyCount}</p>
      </div>
      <div className="crm-stat-card border-l-4 border-l-indigo-500">
        <p className="text-sm font-medium text-slate-500">Deals generated</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{metrics.dealsCreatedCount}</p>
      </div>
    </div>
  );
}
