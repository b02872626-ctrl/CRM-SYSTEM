import { notFound } from "next/navigation";
import { ActivityForm } from "@/features/activities/components/activity-form";
import { ActivityTimeline } from "@/features/activities/components/activity-timeline";
import { CandidateDetail } from "@/features/candidates/components/candidate-detail";
import { getCandidateActivities, getCandidateById } from "@/features/candidates/queries";

type CandidateDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = await params;
  const data = await Promise.all([getCandidateById(id), getCandidateActivities(id)]).catch(
    () => null
  );

  if (!data) {
    notFound();
  }

  const [candidate, activities] = data as [
    Awaited<ReturnType<typeof getCandidateById>>,
    Awaited<ReturnType<typeof getCandidateActivities>>
  ];

  if (!candidate) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <CandidateDetail candidate={candidate} />
        <ActivityTimeline
          title="Activity timeline"
          items={activities}
          emptyMessage="No activity logged for this candidate yet."
        />
      </div>
      <div>
        <ActivityForm target={{ candidateId: id }} returnPath={`/candidates/${id}`} />
      </div>
    </div>
  );
}
