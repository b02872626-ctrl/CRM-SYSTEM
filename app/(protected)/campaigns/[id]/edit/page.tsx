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
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Campaigns
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Edit campaign</h2>
        <p className="mt-1 text-sm text-slate-600">Update campaign ownership, dates, and targeting notes.</p>
      </div>

      <CampaignForm mode="edit" owners={data.owners} campaign={data.campaign} />
    </section>
  );
}
