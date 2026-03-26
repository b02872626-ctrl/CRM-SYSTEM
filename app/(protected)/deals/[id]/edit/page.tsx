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
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Hiring Requests
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Edit deal</h2>
        <p className="mt-1 text-sm text-slate-600">Update the hiring request details.</p>
      </div>

      <DealForm mode="edit" companies={companies} recruiters={recruiters} deal={deal} />
    </section>
  );
}
