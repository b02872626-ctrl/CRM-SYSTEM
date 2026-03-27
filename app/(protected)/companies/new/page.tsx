import { CompanyForm } from "@/features/companies/components/company-form";
import { getCompanyFormOptions } from "@/features/companies/queries";

export default async function NewCompanyPage() {
  const { owners } = await getCompanyFormOptions();

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Target Companies
        </p>
        <h2 className="crm-page-title mt-2">Add company</h2>
        <p className="crm-page-copy mt-1">
          Add a target company and an optional primary contact in one step.
        </p>
      </div>

      <CompanyForm owners={owners} />
    </section>
  );
}
