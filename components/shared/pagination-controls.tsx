import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-3 border border-white/5 bg-white/[0.02] px-6 py-3 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between rounded-sm backdrop-blur-sm">
      <p className="font-medium">
        Showing <span className="text-white/90">{from}-{to}</span> of <span className="text-white/90">{totalCount}</span>
      </p>
      <div className="flex items-center gap-3">
        <Link
          href={buildHref(basePath, currentPage - 1, searchParams)}
          aria-disabled={currentPage <= 1}
          className={cn(
            "inline-flex h-9 items-center rounded-sm border px-4 text-xs font-bold transition-all",
            currentPage <= 1
              ? "pointer-events-none border-white/5 text-white/10"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          Previous
        </Link>
        <span className="text-white/20 font-bold uppercase text-[10px] tracking-[0.2em]">
          Page {currentPage} / {totalPages}
        </span>
        <Link
          href={buildHref(basePath, currentPage + 1, searchParams)}
          aria-disabled={currentPage >= totalPages}
          className={cn(
            "inline-flex h-9 items-center rounded-lg border px-4 text-xs font-bold transition-all",
            currentPage >= totalPages
              ? "pointer-events-none border-white/5 text-white/10"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
