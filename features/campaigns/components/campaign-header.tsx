import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type CampaignHeaderProps = {
  campaign: {
    id: string;
    name: string;
    campaign_type: string | null;
    target_audience: string | null;
    status: string;
  };
};

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <div className="mb-6 border-b border-white/5 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h2>
          <p className="mt-1 text-sm text-white/40">
            {campaign.campaign_type ?? "No type"} | {campaign.target_audience ?? "No audience"} |{" "}
            <span className="font-semibold text-white/60 tracking-tight">{campaign.status}</span>
          </p>
        </div>
        <Link 
          href="/campaigns" 
          className="crm-secondary-button flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Link>
      </div>
    </div>
  );
}
