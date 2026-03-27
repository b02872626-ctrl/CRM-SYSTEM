"use client";

import { cn } from "@/lib/utils";

export function CRMSkeleton() {
  return (
    <div className="crm-page animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="crm-page-header">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded-full bg-white/5" />
          <div className="h-8 w-48 rounded-md bg-white/5" />
          <div className="h-4 w-96 rounded-md bg-white/5" />
        </div>
        <div className="h-9 w-32 rounded-md bg-white/5" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        <div className="h-9 w-64 rounded-md bg-white/5" />
        <div className="h-9 w-32 rounded-md bg-white/5" />
        <div className="h-9 w-32 rounded-md bg-white/5" />
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.01] p-1">
        <div className="h-10 w-full rounded-md bg-white/5" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            <div className="h-4 w-8 rounded bg-white/5" />
            <div className="h-4 flex-1 rounded bg-white/5" />
            <div className="h-4 w-24 rounded bg-white/5" />
            <div className="h-4 w-32 rounded bg-white/5" />
            <div className="h-4 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
