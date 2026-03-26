import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CandidatesFilters } from "@/features/candidates/components/candidates-filters";
import { CandidatesTable } from "@/features/candidates/components/candidates-table";
import { getCandidateListFilterOptions, getCandidates } from "@/features/candidates/queries";
import type { CandidateStage } from "@/types/database";

type CandidatesPageProps = {
  searchParams: Promise<{
    stage?: CandidateStage | "all";
    source?: string | "all";
    deal?: string | "all";
    page?: string;
  }>;
};

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const [candidatesResult, options] = await Promise.all([
    getCandidates({
      stage: params.stage,
      source: params.source,
      deal: params.deal
    }, page),
    getCandidateListFilterOptions()
  ]);

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Candidate Pipeline</p>
          <h2 className="crm-page-title">Candidates</h2>
          <p className="crm-page-copy">
            Track sourcing progress and linked deal progress in one list.
          </p>
        </div>

        <Link href="/candidates/new" className="crm-primary-button">
          Create candidate
        </Link>
      </div>

      <CandidatesFilters
        deals={options.deals}
        sources={options.sources}
        selectedStage={params.stage}
        selectedSource={params.source}
        selectedDeal={params.deal}
      />

      <CandidatesTable candidates={candidatesResult.items} />

      <PaginationControls
        basePath="/candidates"
        page={page}
        pageSize={candidatesResult.pageSize}
        totalCount={candidatesResult.totalCount}
        searchParams={{
          stage: params.stage,
          source: params.source,
          deal: params.deal
        }}
      />
    </section>
  );
}
