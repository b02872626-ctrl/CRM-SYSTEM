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
    <div className="crm-page-header">
      <div>
        <p className="crm-page-kicker">Campaigns</p>
        <h2 className="crm-page-title">{campaign.name}</h2>
        <p className="crm-page-copy">
          {campaign.campaign_type ?? "No type"} | {campaign.target_audience ?? "No audience"} |{" "}
          {campaign.status}
        </p>
      </div>

      <Link href={`/campaigns/${campaign.id}/edit`} className="crm-secondary-button">
        Edit campaign
      </Link>
    </div>
  );
}
