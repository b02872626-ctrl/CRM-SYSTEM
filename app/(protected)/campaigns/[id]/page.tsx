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
    search?: string;
  }>;
};

async function CampaignDetailContent({ id, page, search }: { id: string; page: number; search?: string }) {
  const [campaign, linkedCompaniesResult, availableCompanies, metrics] = await Promise.all([
    getCampaignById(id),
    getCampaignCompanies(id, page, search),
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
      searchQuery={search}
    />
  );
}

export default async function CampaignDetailPage({ params, searchParams }: CampaignDetailPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const page = Math.max(1, Number(sParams.page ?? "1") || 1);
  const search = sParams.search;

  return (
    <Suspense fallback={<TableSkeleton rows={10} />}>
      <CampaignDetailContent id={id} page={page} search={search} />
    </Suspense>
  );
}
