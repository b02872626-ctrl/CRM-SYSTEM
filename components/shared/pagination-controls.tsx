import Link from "next/link";

type PaginationControlsProps = {
  basePath: string;
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function PaginationControls({
  basePath,
  page,
  pageSize,
  totalCount,
  searchParams = {}
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {from}-{to} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(basePath, currentPage - 1, searchParams)}
          aria-disabled={currentPage <= 1}
          className={
            currentPage <= 1
              ? "pointer-events-none inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-slate-400"
              : "inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-slate-700"
          }
        >
          Previous
        </Link>
        <span className="text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        <Link
          href={buildHref(basePath, currentPage + 1, searchParams)}
          aria-disabled={currentPage >= totalPages}
          className={
            currentPage >= totalPages
              ? "pointer-events-none inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-slate-400"
              : "inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-slate-700"
          }
        >
          Next
        </Link>
      </div>
    </div>
  );
}
