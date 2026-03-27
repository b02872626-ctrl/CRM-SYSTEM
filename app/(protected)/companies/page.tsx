import { Suspense } from "react";
import Link from "next/link";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CompaniesTable } from "@/features/companies/components/companies-table";
import { getCompanies } from "@/features/companies/queries";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { getCurrentProfile } from "@/lib/auth";

type CompaniesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

async function CompaniesContent({ 
  page, 
  profile 
}: { 
  page: number;
  profile: { id: string; role: string | null } | null;
}) {
  const result = await getCompanies(page, profile);

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
  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  const isAdmin = profile?.role === "admin";

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

        {isAdmin && (
          <Link href="/companies/new" className="crm-primary-button">
            Create company
          </Link>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between border border-white/5 bg-white/[0.03] px-6 py-4 rounded-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">All companies</h3>
        <div className="flex items-center gap-2">
          {/* Add filters if needed */}
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <CompaniesContent page={page} profile={profile} />
      </Suspense>
    </section>
  );
}
