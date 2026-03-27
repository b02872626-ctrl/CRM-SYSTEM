import { Suspense } from "react";
import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CampaignsFilters } from "@/features/campaigns/components/campaigns-filters";
import { CampaignsTable } from "@/features/campaigns/components/campaigns-table";
import { CampaignsHeader } from "@/features/campaigns/components/campaigns-header";
import { getCampaignFilterOptions, getCampaigns } from "@/features/campaigns/queries";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { getCurrentProfile } from "@/lib/auth";

type CampaignsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    owner?: string;
    page?: string;
  }>;
};

async function CampaignsContent({
  searchParams,
  profile
}: {
  searchParams: { search?: string; status?: string; owner?: string; page?: string };
  profile: { id: string; role: string | null } | null;
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const [campaignsResult, options] = await Promise.all([
    getCampaigns(
      {
        search: searchParams.search,
        status: searchParams.status,
        owner: searchParams.owner
      },
      page,
      profile
    ),
    getCampaignFilterOptions()
  ]);

  return (
    <>
      <CampaignsFilters
        owners={options.owners}
        selectedSearch={searchParams.search}
        selectedStatus={searchParams.status}
        selectedOwner={searchParams.owner}
      />

      <CampaignsTable campaigns={campaignsResult.items} />

      <PaginationControls
        basePath="/campaigns"
        page={page}
        pageSize={campaignsResult.pageSize}
        totalCount={campaignsResult.totalCount}
        searchParams={{
          search: searchParams.search,
          status: searchParams.status,
          owner: searchParams.owner
        }}
      />
    </>
  );
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const { owners } = await getCampaignFilterOptions();

  return (
    <section className="crm-page">
      <CampaignsHeader owners={owners} profile={profile} />

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <CampaignsContent searchParams={params} profile={profile} />
      </Suspense>
    </section>
  );
}
