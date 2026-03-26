import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { DealsFilters } from "@/features/deals/components/deals-filters";
import { DealsTable } from "@/features/deals/components/deals-table";
import { getDealListFilterOptions, getDeals } from "@/features/deals/queries";
import type { DealStage, DealUrgency } from "@/types/database";

type DealsPageProps = {
  searchParams: Promise<{
    status?: DealStage | "all";
    recruiter?: string | "all";
    urgency?: DealUrgency | "all";
    page?: string;
  }>;
};

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const [dealsResult, options] = await Promise.all([
    getDeals({
      status: params.status,
      recruiter: params.recruiter,
      urgency: params.urgency
    }, page),
    getDealListFilterOptions()
  ]);

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Hiring Requests</p>
          <h2 className="crm-page-title">Active deals</h2>
          <p className="crm-page-copy">
            Manage open hiring requests, recruiter ownership, and deal progression.
          </p>
        </div>

        <Link href="/deals/new" className="crm-primary-button">
          Create deal
        </Link>
      </div>

      <DealsFilters
        recruiters={options.recruiters}
        selectedStatus={params.status}
        selectedRecruiter={params.recruiter}
        selectedUrgency={params.urgency}
      />

      <DealsTable deals={dealsResult.items} />

      <PaginationControls
        basePath="/deals"
        page={page}
        pageSize={dealsResult.pageSize}
        totalCount={dealsResult.totalCount}
        searchParams={{
          status: params.status,
          recruiter: params.recruiter,
          urgency: params.urgency
        }}
      />
    </section>
  );
}
