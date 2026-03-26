import { CampaignForm } from "@/features/campaigns/components/campaign-form";
import { getCampaignFormData } from "@/features/campaigns/queries";

export default async function NewCampaignPage() {
  const { owners } = await getCampaignFormData();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Campaigns
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create campaign</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a campaign to group companies under a focused outreach effort.
        </p>
      </div>

      <CampaignForm mode="create" owners={owners} />
    </section>
  );
}
