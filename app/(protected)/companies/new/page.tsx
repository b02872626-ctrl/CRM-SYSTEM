import { CompanyForm } from "@/features/companies/components/company-form";
import { getCompanyFormOptions } from "@/features/companies/queries";

export default async function NewCompanyPage() {
  const { owners } = await getCompanyFormOptions();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Target Companies
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add company</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a target company and an optional primary contact in one step.
        </p>
      </div>

      <CompanyForm owners={owners} />
    </section>
  );
}
