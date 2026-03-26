import { notFound } from "next/navigation";
import { DealDetail } from "@/features/deals/components/deal-detail";
import { getDealActivities, getDealById, getDealCandidates } from "@/features/deals/queries";

type DealDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const data = await Promise.all([
    getDealById(id),
    getDealCandidates(id),
    getDealActivities(id)
  ]).catch(() => null);

  if (!data) {
    notFound();
  }

  const [deal, candidates, activities] = data;

  if (!deal) {
    notFound();
  }

  return <DealDetail deal={deal} candidates={candidates} activities={activities} />;
}
