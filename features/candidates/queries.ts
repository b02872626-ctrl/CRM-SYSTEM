import "server-only";
import { cache } from "react";

import type { CandidateStage } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

const CANDIDATES_PAGE_SIZE = 25;

export type CandidateFilters = {
  stage?: CandidateStage | "all";
  source?: string | "all";
  deal?: string | "all";
};

export const getCandidateListFilterOptions = cache(async () => {
  const supabase = await createClient();

  const [{ data: deals, error: dealsError }, { data: sourcesData, error: sourcesError }] =
    await Promise.all([
      supabase.from("deals").select("id, title, role_title").order("updated_at", { ascending: false }).limit(100),
      supabase.from("candidates").select("source").not("source", "is", null).limit(1000)
    ]);

  if (dealsError) {
    return { deals: [], sources: [] };
  }

  if (sourcesError) {
    return {
      deals: ((deals ?? []) as Array<Record<string, unknown>>).map((deal) => ({
        id: String(deal.id ?? ""),
        title: String(deal.title ?? deal.role_title ?? "Untitled deal")
      })),
      sources: []
    };
  }

  const sourceRows = ((sourcesError ? [] : sourcesData) ?? []) as Array<Record<string, unknown>>;
  const sources = Array.from(
    new Set(
      sourceRows
        .map((item) => item.source)
        .filter((value): value is string => Boolean(value))
    )
  ).sort();

  return {
    deals: ((dealsError ? [] : deals) ?? []).map((deal) => {
      const row = deal as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        title: String(row.title ?? row.role_title ?? "Untitled deal")
      };
    }),
    sources
  };
});

export const getCandidateFormOptions = cache(async () => {
  const supabase = await createClient();
  const [{ data: deals }, { data: recruiters }] = await Promise.all([
    supabase.from("deals").select("*").order("updated_at", { ascending: false }).limit(100),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("updated_at", { ascending: false })
      .limit(100)
  ]);

  return {
    deals: ((deals ?? []) as Array<Record<string, unknown>>).map((deal) => ({
      id: String(deal.id ?? ""),
      title: String(deal.title ?? deal.role_title ?? "Untitled deal")
    })),
    recruiters: ((recruiters ?? []) as Array<Record<string, unknown>>).map((recruiter) => ({
      id: String(recruiter.id ?? ""),
      full_name: String(recruiter.full_name ?? recruiter.email ?? "Unknown user")
    }))
  };
});

export const getCandidates = cache(async (filters: CandidateFilters = {}, page = 1) => {
  const supabase = await createClient();
  const from = (page - 1) * CANDIDATES_PAGE_SIZE;
  const to = from + CANDIDATES_PAGE_SIZE - 1;

  const selectStr = filters.deal && filters.deal !== "all" 
    ? "*, candidate_applications!inner(deal_id)"
    : "*";

  let query = supabase
    .from("candidates")
    .select(selectStr, { count: "exact" })
    .order("updated_at", { ascending: false });

  if (filters.stage && filters.stage !== "all") {
    query = query.eq("stage", filters.stage);
  }

  if (filters.source && filters.source !== "all") {
    query = query.eq("source", filters.source);
  }

  if (filters.deal && filters.deal !== "all") {
    query = query.eq("candidate_applications.deal_id", filters.deal);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { items: [], totalCount: 0, pageSize: CANDIDATES_PAGE_SIZE };
  }

  return {
    items: ((data ?? []) as Array<Record<string, unknown>>).map((candidate) => ({
      id: String(candidate.id ?? ""),
      first_name: String(candidate.first_name ?? candidate.name ?? "Unknown"),
      last_name: String(candidate.last_name ?? ""),
      source: typeof candidate.source === "string" ? candidate.source : null,
      stage: String(candidate.stage ?? "unknown"),
      application: null
    })),
    totalCount: count ?? 0,
    pageSize: CANDIDATES_PAGE_SIZE
  };
});

export const getCandidateById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load candidate ${id}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const candidate = data as Record<string, unknown>;

  return {
    id: String(candidate.id ?? id),
    first_name: String(candidate.first_name ?? candidate.name ?? "Unknown"),
    last_name: String(candidate.last_name ?? ""),
    email: typeof candidate.email === "string" ? candidate.email : null,
    phone: typeof candidate.phone === "string" ? candidate.phone : null,
    location: typeof candidate.location === "string" ? candidate.location : null,
    source: typeof candidate.source === "string" ? candidate.source : null,
    stage: String(candidate.stage ?? "unknown"),
    current_title: typeof candidate.current_title === "string" ? candidate.current_title : null,
    linkedin_url: typeof candidate.linkedin_url === "string" ? candidate.linkedin_url : null,
    notes: typeof candidate.notes === "string" ? candidate.notes : null,
    assigned_profile_id:
      typeof candidate.assigned_profile_id === "string" ? candidate.assigned_profile_id : null,
    recruiter: null,
    applications: []
  };
});

export async function getCandidateActivities(candidateId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(
      `
        id,
        activity_type,
        summary,
        details,
        created_at,
        due_at,
        completed_at,
        profile:profiles(id, full_name),
        deal:deals(id, title, role_title)
      `
    )
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("column deals_1.title does not exist")) {
      const { data: retryData, error: retryError } = await supabase
        .from("activities")
        .select(
          `
            id,
            activity_type,
            summary,
            details,
            created_at,
            due_at,
            completed_at,
            profile:profiles(id, full_name),
            deal:deals(id, role_title)
          `
        )
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });
      
      if (!retryError && retryData) {
        return (retryData as any[]).map(act => ({
          ...act,
          deal: act.deal ? {
            id: act.deal.id,
            title: act.deal.role_title ?? "Untitled deal"
          } : null
        }));
      }
    }
    console.error(`Failed to load candidate activities for ${candidateId}:`, error.message);
    return [];
  }

  return (data as any[]).map(act => ({
    ...act,
    deal: act.deal ? {
      id: act.deal.id,
      title: act.deal.title ?? act.deal.role_title ?? "Untitled deal"
    } : null
  }));
}

export async function getCandidateFormData(id?: string) {
  const [options, candidate] = await Promise.all([
    getCandidateFormOptions(),
    id ? getCandidateById(id) : Promise.resolve(null)
  ]);

  return {
    ...options,
    candidate
  };
}
