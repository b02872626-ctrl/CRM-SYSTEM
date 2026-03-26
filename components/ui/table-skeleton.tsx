import { cn } from "@/lib/utils";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-10 w-full bg-slate-100 rounded-md" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-white border border-slate-200 rounded-lg p-4">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="mt-2 h-8 w-12 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}
