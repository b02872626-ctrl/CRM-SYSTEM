import { CandidateForm } from "@/features/candidates/components/candidate-form";
import { getCandidateFormData } from "@/features/candidates/queries";

export default async function NewCandidatePage() {
  const { deals, recruiters } = await getCandidateFormData();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Candidate Pipeline
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create candidate</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a candidate profile and optionally link them to a hiring request.
        </p>
      </div>

      <CandidateForm mode="create" deals={deals} recruiters={recruiters} />
    </section>
  );
}
