import { notFound } from "next/navigation";
import { CandidateForm } from "@/features/candidates/components/candidate-form";
import { getCandidateFormData } from "@/features/candidates/queries";

type EditCandidatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCandidatePage({ params }: EditCandidatePageProps) {
  const { id } = await params;
  const data = await getCandidateFormData(id).catch(() => null);

  if (!data?.candidate) {
    notFound();
  }

  const { deals, recruiters, candidate } = data;

  return (
    <section className="space-y-6">
      <div className="crm-stat-card">
        <p className="crm-label">
          Candidate Pipeline
        </p>
        <h2 className="crm-page-title mt-2">Edit candidate</h2>
        <p className="crm-page-copy mt-1">Update candidate details and deal link.</p>
      </div>

      <CandidateForm mode="edit" deals={deals} recruiters={recruiters} candidate={candidate} />
    </section>
  );
}
