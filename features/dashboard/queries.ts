import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const getDashboardData = unstable_cache(
  async () => {
    const supabase = await createClient();
    const today = startOfTodayUtc();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const [
      { count: dueTodayCount, error: dueTodayError },
      { count: overdueCount, error: overdueError },
      { data: deals, error: dealsError },
      { data: candidates, error: candidatesError }
    ] = await Promise.all([
      supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .gte("due_at", today.toISOString())
        .lt("due_at", tomorrow.toISOString())
        .is("completed_at", null),
      supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .lt("due_at", today.toISOString())
        .is("completed_at", null),
      supabase
        .from("deals")
        .select("id, title, role_title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(2),
      supabase
        .from("candidates")
        .select("id, first_name, last_name, name, updated_at")
        .order("updated_at", { ascending: false })
        .limit(2)
    ]);

    const dealRows = ((dealsError ? [] : deals) ?? []) as Array<Record<string, unknown>>;
    const candidateRows = ((candidatesError ? [] : candidates) ?? []) as Array<Record<string, unknown>>;

    const recentRecords = [
      ...dealRows.map((item) => ({
        id: String(item.id ?? ""),
        label: String(item.title ?? item.role_title ?? "Untitled deal"),
        type: "Deal",
        href: `/deals/${String(item.id ?? "")}`,
        updated_at: String(item.updated_at ?? new Date(0).toISOString())
      })),
      ...candidateRows.map((item) => ({
        id: String(item.id ?? ""),
        label: [item.first_name, item.last_name]
          .filter((value): value is string => typeof value === "string" && value.length > 0)
          .join(" ") || String(item.name ?? "Unnamed candidate"),
        type: "Candidate",
        href: `/candidates/${String(item.id ?? "")}`,
        updated_at: String(item.updated_at ?? new Date(0).toISOString())
      }))
    ]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6);

    return {
      dueTodayCount: dueTodayError ? 0 : dueTodayCount ?? 0,
      overdueCount: overdueError ? 0 : overdueCount ?? 0,
      recentRecords
    };
  },
  ["dashboard-data"],
  { revalidate: 60, tags: ["dashboard-data"] }
);
