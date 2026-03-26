import { notFound } from "next/navigation";
import { CampaignDetail } from "@/features/campaigns/components/campaign-detail";
import {
  getAvailableCompaniesForCampaign,
  getCampaignById,
  getCampaignCompanies,
  getCampaignMetrics
} from "@/features/campaigns/queries";

type CampaignDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function CampaignDetailPage({ params, searchParams }: CampaignDetailPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const page = Math.max(1, Number(sParams.page ?? "1") || 1);

  const data = await Promise.all([
    getCampaignById(id),
    getCampaignCompanies(id, page),
    getAvailableCompaniesForCampaign(id),
    getCampaignMetrics(id)
  ]).catch(() => null);

  if (!data || !data[0]) {
    notFound();
  }

  const [campaign, linkedCompaniesResult, availableCompanies, metrics] = data;

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
