import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CampaignsFilters } from "@/features/campaigns/components/campaigns-filters";
import { CampaignsTable } from "@/features/campaigns/components/campaigns-table";
import { getCampaignFilterOptions, getCampaigns } from "@/features/campaigns/queries";

type CampaignsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    owner?: string;
    page?: string;
  }>;
};

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const [campaignsResult, options] = await Promise.all([
    getCampaigns({
      search: params.search,
      status: params.status,
      owner: params.owner
    }, page),
    getCampaignFilterOptions()
  ]);

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

      <CampaignsFilters
        owners={options.owners}
        selectedSearch={params.search}
        selectedStatus={params.status}
        selectedOwner={params.owner}
      />

      <CampaignsTable campaigns={campaignsResult.items} />

      <PaginationControls
        basePath="/campaigns"
        page={page}
        pageSize={campaignsResult.pageSize}
        totalCount={campaignsResult.totalCount}
        searchParams={{
          search: params.search,
          status: params.status,
          owner: params.owner
        }}
      />
    </section>
  );
}
