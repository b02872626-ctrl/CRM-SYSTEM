import Link from "next/link";

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
    <div className="mb-6 border-b border-slate-200 pb-4">
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">{campaign.name}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {campaign.campaign_type ?? "No type"} | {campaign.target_audience ?? "No audience"} |{" "}
        <span className="font-medium text-blue-600">{campaign.status}</span>
      </p>
    </div>
  );
}
