"use server";

import { revalidatePath } from "next/cache";
import type { ActivityType, Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const activityTypes: ActivityType[] = [
  "note",
  "call",
  "email",
  "meeting",
  "status_change",
  "task"
];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeOptionalString(value: string) {
  return value ? value : null;
}

function ensureActivityType(value: string): ActivityType {
  return activityTypes.includes(value as ActivityType) ? (value as ActivityType) : "note";
}

function toIsoDate(value: string | null) {
  return value ? `${value}T12:00:00.000Z` : null;
}

export async function createActivityAction(formData: FormData) {
  const supabase = await createClient();
  const profile = (await getCurrentProfile()) as { id: string } | null;
  const summary = getString(formData, "summary");

  if (!summary) {
    throw new Error("Activity summary is required.");
  }

  const payload: Database["public"]["Tables"]["activities"]["Insert"] = {
    activity_type: ensureActivityType(getString(formData, "activity_type")),
    summary,
    details: normalizeOptionalString(getString(formData, "next_step")),
    due_at: toIsoDate(normalizeOptionalString(getString(formData, "next_step_date"))),
    created_at:
      toIsoDate(normalizeOptionalString(getString(formData, "activity_date"))) ??
      new Date().toISOString(),
    profile_id: profile?.id ?? null,
    company_id: normalizeOptionalString(getString(formData, "company_id")),
    deal_id: normalizeOptionalString(getString(formData, "deal_id")),
    candidate_id: normalizeOptionalString(getString(formData, "candidate_id"))
  };

  const activitiesTable = supabase.from("activities") as unknown as {
    insert: (values: Database["public"]["Tables"]["activities"]["Insert"]) => Promise<{
      error: { message: string } | null;
    }>;
  };

  const { error } = await activitiesTable.insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  const redirectPath = getString(formData, "return_path") || "/dashboard";

  revalidatePath("/dashboard");
  revalidatePath("/companies");
  revalidatePath("/deals");
  revalidatePath("/candidates");
  revalidatePath(redirectPath);
}
