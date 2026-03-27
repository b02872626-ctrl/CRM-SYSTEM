import { notFound } from "next/navigation";
import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { getCampaignFormData } from "@/features/campaigns/queries";

type EditCampaignPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = await params;
  const data = await getCampaignFormData(id).catch(() => null);

  if (!data?.campaign) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Campaigns
        </p>
        <h2 className="crm-page-title mt-2">Edit campaign</h2>
        <p className="crm-page-copy mt-1">Update campaign ownership, dates, and targeting notes.</p>
      </div>

      <CampaignForm mode="edit" owners={data.owners} campaign={data.campaign} />
    </section>
  );
}
