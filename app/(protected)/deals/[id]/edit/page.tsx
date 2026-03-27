import { notFound } from "next/navigation";
import { DealForm } from "@/features/deals/components/deal-form";
import { getDealFormData } from "@/features/deals/queries";

type EditDealPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = await params;
  const data = await getDealFormData(id).catch(() => null);

  if (!data?.deal) {
    notFound();
  }

  const { companies, recruiters, deal } = data;

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Hiring Requests
        </p>
        <h2 className="crm-page-title mt-2">Edit deal</h2>
        <p className="crm-page-copy mt-1">Update the hiring request details.</p>
      </div>

      <DealForm mode="edit" companies={companies} recruiters={recruiters} deal={deal} />
    </section>
  );
}
