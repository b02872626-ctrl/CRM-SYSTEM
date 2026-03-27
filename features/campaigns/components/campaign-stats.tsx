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
      <div className="crm-stat-card relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 rounded-none" />
        <p className="text-sm font-medium text-white/40">Leads (Linked)</p>
        <p className="mt-2 text-3xl font-bold text-white tracking-tight">{metrics.linkedCompanyCount}</p>
      </div>
      <div className="crm-stat-card relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50 rounded-none" />
        <p className="text-sm font-medium text-white/40">Qualified leads</p>
        <p className="mt-2 text-3xl font-bold text-white tracking-tight">{metrics.qualifiedCompanyCount}</p>
      </div>
      <div className="crm-stat-card relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 rounded-none" />
        <p className="text-sm font-medium text-white/40">Deals generated</p>
        <p className="mt-2 text-3xl font-bold text-white tracking-tight">{metrics.dealsCreatedCount}</p>
      </div>
    </div>
  );
}
