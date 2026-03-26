import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CampaignDetail } from "@/features/campaigns/components/campaign-detail";
import {
  getAvailableCompaniesForCampaign,
  getCampaignById,
  getCampaignCompanies,
  getCampaignMetrics
} from "@/features/campaigns/queries";
import { TableSkeleton } from "@/components/ui/table-skeleton";

type CampaignDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

async function CampaignDetailContent({ id, page }: { id: string; page: number }) {
  const [campaign, linkedCompaniesResult, availableCompanies, metrics] = await Promise.all([
    getCampaignById(id),
    getCampaignCompanies(id, page),
    getAvailableCompaniesForCampaign(id),
    getCampaignMetrics(id)
  ]);

  if (!campaign) {
    notFound();
  }

  return (
    <CampaignDetail
      campaign={campaign}
      linkedCompanies={linkedCompaniesResult.items}
      linkedCompaniesTotal={linkedCompaniesResult.totalCount}
      linkedCompaniesPageSize={linkedCompaniesResult.pageSize}
      currentPage={page}
      availableCompanies={availableCompanies}
      metrics={metrics}
    />
  );
}

export default async function CampaignDetailPage({ params, searchParams }: CampaignDetailPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const page = Math.max(1, Number(sParams.page ?? "1") || 1);

  return (
    <Suspense fallback={<TableSkeleton rows={10} />}>
      <CampaignDetailContent id={id} page={page} />
    </Suspense>
  );
}
