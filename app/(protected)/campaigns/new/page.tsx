import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { getCampaignFormData } from "@/features/campaigns/queries";
import { getCurrentProfile } from "@/lib/auth";

export default async function NewCampaignPage() {
  const [{ owners }, profile] = await Promise.all([
    getCampaignFormData(),
    getCurrentProfile()
  ]);

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Campaigns
        </p>
        <h2 className="crm-page-title mt-2">Create campaign</h2>
        <p className="crm-page-copy mt-1">
          Add a campaign to group companies under a focused outreach effort.
        </p>
      </div>

      <CampaignForm 
        mode="create" 
        owners={owners} 
        defaultOwnerId={profile?.id} 
      />
    </section>
  );
}
