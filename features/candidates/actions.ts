"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ApplicationStatus, CandidateStage, Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { applicationStatusOptions, candidateStageOptions } from "@/features/candidates/constants";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeOptionalString(value: string) {
  return value ? value : null;
}

function ensureCandidateStage(value: string): CandidateStage {
  return candidateStageOptions.includes(value as CandidateStage)
    ? (value as CandidateStage)
    : "sourced";
}

function ensureApplicationStatus(value: string): ApplicationStatus {
  return applicationStatusOptions.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : "applied";
}

function getCandidatePayload(formData: FormData): Database["public"]["Tables"]["candidates"]["Insert"] {
  const firstName = getString(formData, "first_name");
  const lastName = getString(formData, "last_name");

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required.");
  }

  return {
    first_name: firstName,
    last_name: lastName,
    email: normalizeOptionalString(getString(formData, "email")),
    phone: normalizeOptionalString(getString(formData, "phone")),
    location: normalizeOptionalString(getString(formData, "location")),
    source: normalizeOptionalString(getString(formData, "source")),
    stage: ensureCandidateStage(getString(formData, "stage")),
    current_title: normalizeOptionalString(getString(formData, "current_title")),
    linkedin_url: normalizeOptionalString(getString(formData, "linkedin_url")),
    notes: normalizeOptionalString(getString(formData, "notes")),
    assigned_profile_id: normalizeOptionalString(getString(formData, "assigned_profile_id"))
  };
}

async function upsertPrimaryApplication(
  supabase: Awaited<ReturnType<typeof createClient>>,
  candidateId: string,
  formData: FormData,
  assignedProfileId: string | null | undefined
) {
  const linkedDealId = normalizeOptionalString(getString(formData, "linked_deal_id"));
  const primaryApplicationId = normalizeOptionalString(getString(formData, "primary_application_id"));
  const applicationStatus = ensureApplicationStatus(getString(formData, "application_status"));
  const applicationNotes = normalizeOptionalString(getString(formData, "application_notes"));

  const applicationsTable = supabase.from("candidate_applications") as unknown as {
    insert: (values: Database["public"]["Tables"]["candidate_applications"]["Insert"]) => Promise<{ error: { message: string } | null }>;
    update: (values: Database["public"]["Tables"]["candidate_applications"]["Update"]) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
    delete: () => { eq: (column: string, value: string) => Promise<{ error: { message: string } | null }> };
  };

  if (!linkedDealId) {
    if (primaryApplicationId) {
      const { error } = await applicationsTable.delete().eq("id", primaryApplicationId);

      if (error) {
        throw new Error(error.message);
      }
    }

    return;
  }

  if (primaryApplicationId) {
    const { error } = await applicationsTable
      .update({
        deal_id: linkedDealId,
        assigned_profile_id: assignedProfileId ?? null,
        status: applicationStatus,
        notes: applicationNotes,
        last_stage_at: new Date().toISOString()
      })
      .eq("id", primaryApplicationId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await applicationsTable.insert({
    candidate_id: candidateId,
    deal_id: linkedDealId,
    assigned_profile_id: assignedProfileId ?? null,
    status: applicationStatus,
    notes: applicationNotes
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCandidateAction(formData: FormData) {
  const supabase = await createClient();
  const payload = getCandidatePayload(formData);
  const candidatesTable = supabase.from("candidates") as unknown as {
    insert: (values: Database["public"]["Tables"]["candidates"]["Insert"]) => {
      select: (columns: string) => { single: () => Promise<{ data: { id: string }; error: { message: string } | null }> };
    };
  };

  const { data, error } = await candidatesTable.insert(payload).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  await upsertPrimaryApplication(supabase, data.id, formData, payload.assigned_profile_id);

  revalidatePath("/candidates");
  revalidatePath("/deals");
  redirect(`/candidates/${data.id}`);
}

export async function updateCandidateAction(formData: FormData) {
  const supabase = await createClient();
  const id = getString(formData, "id");

  if (!id) {
    throw new Error("Candidate id is required.");
  }

  const payload = getCandidatePayload(formData);
  const candidatesTable = supabase.from("candidates") as unknown as {
    update: (values: Database["public"]["Tables"]["candidates"]["Update"]) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await candidatesTable.update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await upsertPrimaryApplication(supabase, id, formData, payload.assigned_profile_id);

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${id}`);
  revalidatePath("/deals");
  redirect(`/candidates/${id}`);
}
