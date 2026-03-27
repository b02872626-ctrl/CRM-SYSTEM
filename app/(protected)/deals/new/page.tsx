import { DealForm } from "@/features/deals/components/deal-form";
import { getDealFormData } from "@/features/deals/queries";

export default async function NewDealPage() {
  const { companies, recruiters } = await getDealFormData();

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Hiring Requests
        </p>
        <h2 className="crm-page-title mt-2">Create deal</h2>
        <p className="crm-page-copy mt-1">
          Add a new hiring request and assign it to a recruiter.
        </p>
      </div>

      <DealForm mode="create" companies={companies} recruiters={recruiters} />
    </section>
  );
}
