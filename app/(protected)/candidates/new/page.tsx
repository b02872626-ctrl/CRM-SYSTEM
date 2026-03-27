import { CandidateForm } from "@/features/candidates/components/candidate-form";
import { getCandidateFormData } from "@/features/candidates/queries";

export default async function NewCandidatePage() {
  const { deals, recruiters } = await getCandidateFormData();

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Candidate Pipeline
        </p>
        <h2 className="crm-page-title mt-2">Create candidate</h2>
        <p className="crm-page-copy mt-1">
          Add a candidate profile and optionally link them to a hiring request.
        </p>
      </div>

      <CandidateForm mode="create" deals={deals} recruiters={recruiters} />
    </section>
  );
}
