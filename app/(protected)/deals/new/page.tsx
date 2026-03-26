import { DealForm } from "@/features/deals/components/deal-form";
import { getDealFormData } from "@/features/deals/queries";

export default async function NewDealPage() {
  const { companies, recruiters } = await getDealFormData();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Hiring Requests
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create deal</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a new hiring request and assign it to a recruiter.
        </p>
      </div>

      <DealForm mode="create" companies={companies} recruiters={recruiters} />
    </section>
  );
}
