import { Suspense } from "react";
import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CampaignsFilters } from "@/features/campaigns/components/campaigns-filters";
import { CampaignsTable } from "@/features/campaigns/components/campaigns-table";
import { getCampaignFilterOptions, getCampaigns } from "@/features/campaigns/queries";
import { TableSkeleton } from "@/components/ui/table-skeleton";

type CampaignsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    owner?: string;
    page?: string;
  }>;
};

async function CampaignsContent({
  searchParams
}: {
  searchParams: { search?: string; status?: string; owner?: string; page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const [campaignsResult, options] = await Promise.all([
    getCampaigns(
      {
        search: searchParams.search,
        status: searchParams.status,
        owner: searchParams.owner
      },
      page
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

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Campaigns</p>
          <h2 className="crm-page-title">Campaigns</h2>
          <p className="crm-page-copy">
            Organize outbound focus areas before working companies, deals, and candidates.
          </p>
        </div>

        <Link href="/campaigns/new" className="crm-primary-button">
          Create campaign
        </Link>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <CampaignsContent searchParams={params} />
      </Suspense>
    </section>
  );
}
