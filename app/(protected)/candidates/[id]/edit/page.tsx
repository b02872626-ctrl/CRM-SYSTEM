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
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Candidate Pipeline
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Edit candidate</h2>
        <p className="mt-1 text-sm text-slate-600">Update candidate details and deal link.</p>
      </div>

      <CandidateForm mode="edit" deals={deals} recruiters={recruiters} candidate={candidate} />
    </section>
  );
}
