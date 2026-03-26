import { Suspense } from "react";
import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CompaniesTable } from "@/features/companies/components/companies-table";
import { getCompanies } from "@/features/companies/queries";
import { TableSkeleton } from "@/components/ui/table-skeleton";

type CompaniesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

async function CompaniesContent({ page }: { page: number }) {
  const result = await getCompanies(page);

  return (
    <>
      <CompaniesTable companies={result.items} />

      <PaginationControls
        basePath="/companies"
        page={page}
        pageSize={result.pageSize}
        totalCount={result.totalCount}
      />
    </>
  );
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  return (
    <section className="crm-page">
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Companies</p>
          <h2 className="crm-page-title">Companies</h2>
          <p className="crm-page-copy">
            Centralize all data about the organizations you are targeting or working with.
          </p>
        </div>

        <Link href="/companies/new" className="crm-primary-button">
          Create company
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between border border-slate-200 bg-white px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">All companies</h3>
        <div className="flex items-center gap-2">
          {/* Add filters if needed */}
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <CompaniesContent page={page} />
      </Suspense>
    </section>
  );
}
