import { cn } from "@/lib/utils";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-10 w-full bg-white/5 rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-full bg-white/[0.02] border border-white/5 rounded-xl" />
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
        <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="h-3 w-24 bg-white/5 rounded-full" />
          <div className="mt-4 h-8 w-12 bg-white/10 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
