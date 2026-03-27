"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CampaignStatus, Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { isCampaignStatus } from "@/features/campaigns/constants";

import { parseCsvRow, parseCsv, normalizeOptionalString, getString, getStringList, extractLinkedInUrl } from "./utils";

function ensureCompanyStatus(value: string): Database["public"]["Tables"]["companies"]["Row"]["status"] {
  const normalized = value.toLowerCase();

  if (
    normalized === "target" ||
    normalized === "researching" ||
    normalized === "contacted" ||
    normalized === "qualified" ||
    normalized === "inactive" ||
    normalized === "lost" ||
    normalized === "won"
  ) {
    return normalized as Database["public"]["Tables"]["companies"]["Row"]["status"];
  }

  return "target";
}

async function getOwnerIdFromRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: Record<string, string>
) {
  const ownerId = normalizeOptionalString((row.owner_id ?? "").trim());

  if (ownerId) {
    return ownerId;
  }

  const ownerEmail = normalizeOptionalString((row.owner_email ?? "").trim().toLowerCase());

  if (!ownerEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", ownerEmail)
    .maybeSingle();

  if (error) {
    return null;
  }

  return ((data as { id?: string } | null)?.id ?? null);
}

function ensureCampaignStatus(value: string): CampaignStatus {
  return isCampaignStatus(value) ? value : "Draft";
}

function getCampaignPayload(formData: FormData): Database["public"]["Tables"]["campaigns"]["Insert"] {
  const name = getString(formData, "name");

  if (!name) {
    throw new Error("Campaign name is required.");
  }

  return {
    name,
    description: normalizeOptionalString(getString(formData, "description")),
    campaign_type: normalizeOptionalString(getString(formData, "campaign_type")),
    target_audience: normalizeOptionalString(getString(formData, "target_audience")),
    status: ensureCampaignStatus(getString(formData, "status")),
    owner_id: normalizeOptionalString(getString(formData, "owner_id")),
    start_date: normalizeOptionalString(getString(formData, "start_date")),
    end_date: normalizeOptionalString(getString(formData, "end_date")),
    notes: normalizeOptionalString(getString(formData, "notes"))
  };
}

async function insertMissingCampaignCompanies(
  campaignId: string,
  companyIds: string[],
  campaignStatus: string | null,
  interestLevel: string | null,
  notes: string | null
) {
  if (companyIds.length === 0) {
    return;
  }

  const supabase = await createClient();
  const linksTable = supabase.from("campaign_companies") as unknown as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        in: (
          inColumn: string,
          values: string[]
        ) => Promise<{ data: Array<{ company_id: string }>; error: { message: string } | null }>;
      };
    };
    insert: (
      values: Database["public"]["Tables"]["campaign_companies"]["Insert"][]
    ) => Promise<{ error: { message: string } | null }>;
  };

  const { data: existingLinks, error: existingError } = await linksTable
    .select("company_id")
    .eq("campaign_id", campaignId)
    .in("company_id", companyIds);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingIds = new Set((existingLinks ?? []).map((item) => item.company_id));
  const newLinks = companyIds
    .filter((companyId) => !existingIds.has(companyId))
    .map((companyId) => ({
      campaign_id: campaignId,
      company_id: companyId,
      campaign_status: campaignStatus,
      interest_level: interestLevel,
      notes
    }));

  if (newLinks.length === 0) {
    return;
  }

  const { error } = await linksTable.insert(newLinks);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCampaignAction(formData: FormData) {
  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can create campaigns.");
  }

  const supabase = await createClient();
  const payload = getCampaignPayload(formData);
  const campaignsTable = supabase.from("campaigns") as unknown as {
    insert: (values: Database["public"]["Tables"]["campaigns"]["Insert"]) => {
      select: (columns: string) => {
        single: () => Promise<{ data: { id: string }; error: { message: string } | null }>;
      };
    };
  };

  const { data, error } = await campaignsTable.insert(payload).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/campaigns");
  redirect(`/campaigns/${data.id}`);
}

export async function updateCampaignAction(formData: FormData) {
  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  const id = getString(formData, "id");
  if (!id) throw new Error("Campaign id is required.");

  const supabase = await createClient();
  
  // Check permission: Admin or Owner
  if (profile?.role !== "admin") {
    const { data: campaign } = await (supabase
      .from("campaigns")
      .select("owner_id")
      .eq("id", id)
      .maybeSingle() as any);
      
    if (campaign?.owner_id !== profile?.id) {
      throw new Error("Unauthorized: Only the campaign owner or an admin can update this campaign.");
    }
  }

  const payload = getCampaignPayload(formData);
  const campaignsTable = supabase.from("campaigns") as unknown as {
    update: (values: Database["public"]["Tables"]["campaigns"]["Update"]) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await campaignsTable.update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  redirect(`/campaigns/${id}`);
}

export async function addCompaniesToCampaignAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const companyIds = getStringList(formData, "company_ids");

  if (!campaignId || companyIds.length === 0) {
    throw new Error("Campaign and at least one company are required.");
  }

  await insertMissingCampaignCompanies(
    campaignId,
    companyIds,
    normalizeOptionalString(getString(formData, "campaign_status")) ?? "Added",
    normalizeOptionalString(getString(formData, "interest_level")) ?? "ICE Cold",
    normalizeOptionalString(getString(formData, "notes"))
  );

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  redirect(`/campaigns/${campaignId}`);
}

export async function linkCompanyToCampaignAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const companyId = getString(formData, "company_id");

  if (!campaignId || !companyId) {
    throw new Error("Campaign and company are required.");
  }

  await insertMissingCampaignCompanies(
    campaignId,
    [companyId],
    normalizeOptionalString(getString(formData, "campaign_status")) ?? "Added",
    normalizeOptionalString(getString(formData, "interest_level")) ?? "ICE Cold",
    normalizeOptionalString(getString(formData, "notes"))
  );

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function importLeadBatchAction(campaignId: string, rawRows: Record<string, string>[]) {
  if (!campaignId || rawRows.length === 0) return { success: true };

  // Normalize row keys to lowercase for robust mapping
  const rows = rawRows.map(row => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key.toLowerCase().replace(/[\s_]+/g, "_")] = value;
    }
    return normalized;
  });

  const supabase = await createClient();
  const profile = (await getCurrentProfile()) as { id?: string } | null;

  // Use the same bulk-optimized logic as the specialized action for consistency and speed
  // 1. Batch Lookups
  const companyNames = rows.map(r => (r.company_name ?? r.company ?? "").trim()).filter(Boolean);
  const ownerEmails = rows.map(r => (r.owner_email ?? "").trim().toLowerCase()).filter(Boolean);

  // Bulk Lookup: Use "or" with "ilike" for case-insensitive batch lookup of companies
  const companyFilters = companyNames.map(name => `company_name.ilike.${name.replace(/,/g, "")}`).join(",");
  
  const [
    { data: existingProfiles },
    { data: existingCompanies }
  ] = await Promise.all([
    supabase.from("profiles").select("id, email").in("email", ownerEmails),
    companyFilters ? supabase.from("companies").select("*").or(companyFilters) : Promise.resolve({ data: [] })
  ]) as any;

  const profilesByEmail = new Map<string, any>((existingProfiles ?? []).map((p: any) => [p.email.toLowerCase(), p.id]));
  const companiesByName = new Map<string, any>((existingCompanies ?? []).map((c: any) => [c.company_name.toLowerCase(), c]));

  const companiesToInsert: any[] = [];
  const companiesToUpdate: any[] = [];
  const rowsWithCompany: { row: Record<string, string>, companyId?: string, isNew: boolean }[] = [];

  // 2. Prepare Companies
  for (const row of rows) {
    const companyName = normalizeOptionalString((row.company_name ?? row.company ?? "").trim());
    if (!companyName) continue;

    const ownerEmail = (row.owner_email ?? "").trim().toLowerCase();
    const ownerId = row.owner_id || profilesByEmail.get(ownerEmail) || null;
    
    const existing = companiesByName.get(companyName.toLowerCase()) as any;
    
    if (!existing) {
      companiesToInsert.push({
        company_name: companyName,
        industry: normalizeOptionalString((row.industry ?? row.company_industry ?? "").trim()),
        company_size: normalizeOptionalString((row.company_size ?? row.size ?? row.employees ?? "").trim()),
        location: normalizeOptionalString((row.location ?? row.company_location ?? row.city ?? row.address ?? "").trim()),
        status: ensureCompanyStatus((row.status ?? row.company_status ?? "").trim()),
        owner_id: ownerId,
        notes: normalizeOptionalString((row.notes ?? row.description ?? row.about ?? "").trim())
      });
      rowsWithCompany.push({ row, isNew: true });
    } else {
      const companyId = existing.id;
      // Healing logic: Only update if fields are null/missing
      const updatePayload: any = {};
      if (!existing.industry) updatePayload.industry = normalizeOptionalString((row.industry ?? row.company_industry ?? "").trim());
      if (!existing.company_size) updatePayload.company_size = normalizeOptionalString((row.company_size ?? row.size ?? row.employees ?? "").trim());
      if (!existing.location) updatePayload.location = normalizeOptionalString((row.location ?? row.company_location ?? row.city ?? row.address ?? "").trim());
      if (!existing.notes) updatePayload.notes = normalizeOptionalString((row.notes ?? row.description ?? row.about ?? "").trim());

      const cleanUpdate = Object.fromEntries(Object.entries(updatePayload).filter(([_, v]) => v !== null));
      if (Object.keys(cleanUpdate).length > 0) {
        companiesToUpdate.push({ id: companyId, ...cleanUpdate });
      }
      rowsWithCompany.push({ row, companyId, isNew: false });
    }
  }

  // 3. Bulk Insert Companies
  if (companiesToInsert.length > 0) {
    const { data: createdCompanies, error: insertError } = await (supabase
      .from("companies") as any)
      .insert(companiesToInsert)
      .select("id, company_name");
    
    if (insertError) {
      console.error("[Import] Companies insert error:", insertError.message, insertError.details);
    }

    if (createdCompanies) {
      const createdByName = new Map((createdCompanies as any[]).map(c => [c.company_name.toLowerCase(), c.id]));
      // Map created IDs back to rows
      rowsWithCompany.forEach(item => {
        if (item.isNew) {
          const name = (item.row.company_name ?? item.row.company ?? "").trim().toLowerCase();
          item.companyId = createdByName.get(name);
        }
      });
    }
  }

  // 4. Individual Updates for Healing
  if (companiesToUpdate.length > 0) {
    const results = await Promise.allSettled(companiesToUpdate.map(upd => 
      (supabase.from("companies") as any).update(upd).eq("id", upd.id)
    ));
    
    results.forEach((res, idx) => {
      if (res.status === 'rejected') {
        console.error(`[Import] Company update failed for ${companiesToUpdate[idx].id}:`, res.reason);
      }
    });
  }

  // 5. Bulk Links, Contacts, Activities
  const linksToUpsert: any[] = [];
  const contactsToUpsert: any[] = [];
  const activitiesToInsert: any[] = [];

  for (const { row, companyId } of rowsWithCompany) {
    if (!companyId) continue;

    linksToUpsert.push({
      campaign_id: campaignId,
      company_id: companyId,
      campaign_status: normalizeOptionalString((row.campaign_status ?? "").trim()) || "Added",
      interest_level: normalizeOptionalString((row.interest_level ?? row.interest ?? row.temperature ?? "").trim()) || "ICE Cold",
      notes: normalizeOptionalString((row.campaign_notes ?? row.notes ?? "").trim())
    });

    const rowKeys = Object.keys(row);
    const findKey = (search: string[]) => rowKeys.find(k => search.every(s => k.includes(s)));

    const contactFullName = normalizeOptionalString((
      row.contact_full_name ?? row.contact_name ?? row.contact ?? row.name ?? 
      row.person ?? row.full_name ?? row.primary_contact ?? 
      row[findKey(["contact", "name"]) || findKey(["contact", "full"]) || findKey(["name"]) || ""] ??
      ""
    ).trim());

    const contactEmail = normalizeOptionalString((
      row.contact_email ?? row.email ?? row.mail ?? 
      row[findKey(["contact", "email"]) || findKey(["email"]) || findKey(["mail"]) || ""] ??
      ""
    ).trim());

    const contactRole = normalizeOptionalString((
      row.contact_job_title ?? row.contact_role_title ?? row.title ?? row.job_title ?? row.role ??
      row[findKey(["contact", "role"]) || findKey(["job", "title"]) || findKey(["title"]) || ""] ??
      ""
    ).trim());

    const contactPhone = normalizeOptionalString((
      row.contact_phone ?? row.phone ?? row.mobile ?? row.tel ??
      row[findKey(["contact", "phone"]) || findKey(["phone"]) || findKey(["mobile"]) || ""] ??
      ""
    ).trim());

    if (contactFullName || contactEmail) {
      const notesForUrl = normalizeOptionalString((row.campaign_notes ?? row.notes ?? "").trim());
      contactsToUpsert.push({
        company_id: companyId,
        full_name: contactFullName ?? "Primary Contact",
        role_title: contactRole,
        phone: contactPhone,
        email: contactEmail,
        linkedin_url: extractLinkedInUrl(notesForUrl)
      });
    }

    const nextStep = normalizeOptionalString((row.next_step ?? "").trim());
    if (nextStep) {
      activitiesToInsert.push({
        company_id: companyId,
        profile_id: profile?.id ?? null,
        activity_type: "task",
        summary: nextStep,
        due_at: normalizeOptionalString((row.next_step_date ?? "").trim())
      });
    }
  }

  if (linksToUpsert.length > 0) {
    const { error: linkError } = await (supabase.from("campaign_companies") as any).upsert(linksToUpsert, { onConflict: "campaign_id,company_id" });
    if (linkError) console.error("[Import] Links error:", linkError.message, linkError.details);
  }
    
  if (contactsToUpsert.length > 0) {
    // Use plain insert with ignoreDuplicates instead of upsert.
    // The onConflict("company_id,email") approach fails silently when email is NULL
    // because PostgreSQL unique constraints don't match NULL values.
    const { error: contactError } = await (supabase.from("contacts") as any).insert(contactsToUpsert, { ignoreDuplicates: true });
    if (contactError) {
      console.error("[Import] Contacts error:", contactError.message, contactError.details);
      console.log("[Import] Failed contact payload sample:", contactsToUpsert[0]);
    } else {
      console.log(`[Import] Successfully inserted ${contactsToUpsert.length} contacts`);
    }
  }
  
  if (activitiesToInsert.length > 0) {
    const { error: activityError } = await (supabase.from("activities") as any).insert(activitiesToInsert);
    if (activityError) console.error("[Import] Activities error:", activityError.message);
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

export async function importCampaignLeadsAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const file = formData.get("csv_file");

  if (!campaignId) {
    throw new Error("Campaign is required.");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("CSV file is required.");
  }

  const rows = parseCsv(await file.text());
  console.log(`[Import] Parsed ${rows.length} rows from CSV`);

  if (rows.length === 0) {
    console.warn("[Import] CSV is empty or parsing failed");
    throw new Error("The CSV file is empty.");
  }

  const supabase = await createClient();
  const profile = (await getCurrentProfile()) as { id?: string } | null;
  const companiesTable = supabase.from("companies") as any;
  const contactsTable = supabase.from("contacts") as any;
  const activitiesTable = supabase.from("activities") as any;
  const campaignCompaniesTable = supabase.from("campaign_companies") as any;

  const BATCH_SIZE = 50;
  const CONCURRENCY = 5;
  
  // Create all batches first
  const batches: any[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  // Helper to process a single batch (extracted from the loop)
  const processBatch = async (batch: any[]) => {
    // 1. Batch Lookups
    const companyNames = batch.map(r => (r.company_name ?? r.company ?? "").trim()).filter(Boolean);
    const ownerEmails = batch.map(r => (r.owner_email ?? "").trim().toLowerCase()).filter(Boolean);

    const [
      { data: existingProfiles },
      { data: existingCompanies }
    ] = await Promise.all([
      supabase.from("profiles").select("id, email").in("email", ownerEmails),
      supabase.from("companies").select("*").in("company_name", companyNames)
    ]) as any;

    const profilesByEmail = new Map<string, any>((existingProfiles ?? []).map((p: any) => [p.email.toLowerCase(), p.id]));
    const companiesByName = new Map<string, any>((existingCompanies ?? []).map((c: any) => [c.company_name.toLowerCase(), c]));

    const companiesToInsert: any[] = [];
    const companiesToUpdate: any[] = [];
    const rowsWithCompany: { row: Record<string, string>, companyId?: string, isNew: boolean }[] = [];

    // 2. Prepare Companies
    for (const row of batch) {
      const companyName = normalizeOptionalString((row.company_name ?? row.company ?? "").trim());
      if (!companyName) continue;

      const ownerEmail = (row.owner_email ?? "").trim().toLowerCase();
      const ownerId = row.owner_id || profilesByEmail.get(ownerEmail) || null;
      
      const existing = companiesByName.get(companyName.toLowerCase()) as any;
      
      if (!existing) {
        companiesToInsert.push({
          company_name: companyName,
          industry: normalizeOptionalString((row.industry ?? row.company_industry ?? "").trim()),
          company_size: normalizeOptionalString((row.company_size ?? row.size ?? row.employees ?? "").trim()),
          location: normalizeOptionalString((row.location ?? row.company_location ?? row.city ?? row.address ?? "").trim()),
          status: ensureCompanyStatus((row.status ?? row.company_status ?? "").trim()),
          owner_id: ownerId,
          notes: normalizeOptionalString((row.notes ?? row.description ?? row.about ?? "").trim())
        });
        rowsWithCompany.push({ row, isNew: true });
      } else {
        const companyId = existing.id;
        const updatePayload: any = {};
        if (!existing.industry) updatePayload.industry = normalizeOptionalString((row.industry ?? row.company_industry ?? "").trim());
        if (!existing.company_size) updatePayload.company_size = normalizeOptionalString((row.company_size ?? row.size ?? row.employees ?? "").trim());
        if (!existing.location) updatePayload.location = normalizeOptionalString((row.location ?? row.company_location ?? row.city ?? row.address ?? "").trim());
        if (!existing.notes) updatePayload.notes = normalizeOptionalString((row.notes ?? row.description ?? row.about ?? "").trim());

        const cleanUpdate = Object.fromEntries(Object.entries(updatePayload).filter(([_, v]) => v !== null));
        if (Object.keys(cleanUpdate).length > 0) {
          companiesToUpdate.push({ id: companyId, ...cleanUpdate });
        }
        rowsWithCompany.push({ row, companyId, isNew: false });
      }
    }

    // 3. Bulk Insert Companies
    if (companiesToInsert.length > 0) {
      const { data: createdCompanies } = await (supabase
        .from("companies") as any)
        .insert(companiesToInsert)
        .select("id, company_name");
      
      if (createdCompanies) {
        const createdByName = new Map((createdCompanies as any[]).map(c => [c.company_name.toLowerCase(), c.id]));
        rowsWithCompany.forEach(item => {
          if (item.isNew) {
            const name = (item.row.company_name ?? item.row.company ?? "").trim().toLowerCase();
            item.companyId = createdByName.get(name);
          }
        });
      }
    }

    // 4. Individual Updates for Healing
    if (companiesToUpdate.length > 0) {
      await Promise.all(companiesToUpdate.map(upd => 
        (supabase.from("companies") as any).update(upd).eq("id", upd.id)
      ));
    }

    // 5. Bulk Links, Contacts, Activities
    const linksToUpsert: any[] = [];
    const contactsToUpsert: any[] = [];
    const activitiesToInsert: any[] = [];

    for (const { row, companyId } of rowsWithCompany) {
      if (!companyId) continue;

      linksToUpsert.push({
        campaign_id: campaignId,
        company_id: companyId,
        campaign_status: normalizeOptionalString((row.campaign_status ?? "").trim()) || "Added",
        interest_level: normalizeOptionalString((row.interest_level ?? row.interest ?? row.temperature ?? "").trim()) || "ICE Cold",
        notes: normalizeOptionalString((row.campaign_notes ?? row.notes ?? "").trim())
      });

      const contactFullName = normalizeOptionalString((row.contact_full_name ?? row.name ?? row.contact_name ?? row.contact ?? "").trim());
      const contactEmail = normalizeOptionalString((row.contact_email ?? row.email ?? "").trim());
      const contactRole = normalizeOptionalString((row.contact_job_title ?? row.contact_role_title ?? row.title ?? row.job_title ?? "").trim());
      const contactPhone = normalizeOptionalString((row.contact_phone ?? row.phone ?? "").trim());

      if (contactFullName || contactEmail) {
        const notesForUrl = normalizeOptionalString((row.campaign_notes ?? row.notes ?? "").trim());
        contactsToUpsert.push({
          company_id: companyId,
          full_name: contactFullName ?? "Primary Contact",
          role_title: contactRole,
          phone: contactPhone,
          email: contactEmail,
          linkedin_url: extractLinkedInUrl(notesForUrl)
        });
      }

      const nextStep = normalizeOptionalString((row.next_step ?? "").trim());
      if (nextStep) {
        activitiesToInsert.push({
          company_id: companyId,
          profile_id: profile?.id ?? null,
          activity_type: "task",
          summary: nextStep,
          due_at: normalizeOptionalString((row.next_step_date ?? "").trim())
        });
      }
    }

    await linksToUpsert.length > 0 ? (supabase.from("campaign_companies") as any).upsert(linksToUpsert, { onConflict: "campaign_id,company_id" }) : Promise.resolve();

    if (contactsToUpsert.length > 0) {
      const { error: contactError } = await (supabase.from("contacts") as any).upsert(contactsToUpsert, { onConflict: "company_id,email" });
      if (contactError) console.error("[Import] Contacts error (batch):", contactError.message, contactError.details);
    }

    if (activitiesToInsert.length > 0) {
      const { error: activityError } = await (supabase.from("activities") as any).insert(activitiesToInsert);
      if (activityError) console.error("[Import] Activities error (batch):", activityError.message);
    }
  };

  // Process batches with concurrency
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(batch => processBatch(batch)));
  }

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  redirect(`/campaigns/${campaignId}`);
}

export async function bulkUpdateLeadStatusAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const companyIds = getStringList(formData, "company_ids");
  const status = getString(formData, "status");
  const interestLevel = getString(formData, "interest_level");

  if (!campaignId || companyIds.length === 0 || (!status && !interestLevel)) {
    throw new Error("Campaign, companies, and either status or interest level are required.");
  }

  const supabase = await createClient();
  const updatePayload: any = {};
  if (status) updatePayload.campaign_status = status;
  if (interestLevel) updatePayload.interest_level = interestLevel;

  const { error } = await (supabase
    .from("campaign_companies") as any)
    .update(updatePayload)
    .eq("campaign_id", campaignId)
    .in("company_id", companyIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function bulkRemoveLeadsAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const companyIds = getStringList(formData, "company_ids");

  if (!campaignId || companyIds.length === 0) {
    throw new Error("Campaign and companies are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("campaign_companies")
    .delete()
    .eq("campaign_id", campaignId)
    .in("company_id", companyIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function createCampaignLeadAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const companyName = getString(formData, "company_name");

  if (!campaignId || !companyName) {
    throw new Error("Campaign and company name are required.");
  }

  const supabase = await createClient();
  const profile = (await getCurrentProfile()) as { id?: string } | null;

  const companiesTable = supabase.from("companies") as unknown as {
    insert: (values: Database["public"]["Tables"]["companies"]["Insert"]) => {
      select: (columns: string) => {
        single: () => Promise<{ data: { id: string }; error: { message: string } | null }>;
      };
    };
  };

  const contactsTable = supabase.from("contacts") as unknown as {
    insert: (
      values: Database["public"]["Tables"]["contacts"]["Insert"]
    ) => Promise<{ error: { message: string } | null }>;
  };

  // 1. Create Company
  const { data: company, error: companyError } = await companiesTable
    .insert({
      company_name: companyName,
      industry: normalizeOptionalString(getString(formData, "industry")),
      company_size: normalizeOptionalString(getString(formData, "company_size")),
      location: normalizeOptionalString(getString(formData, "location")),
      status: ensureCompanyStatus(getString(formData, "company_status") || "target"),
      owner_id: profile?.id
    })
    .select("id")
    .single();

  if (companyError) {
    throw new Error(companyError.message);
  }

  const companyId = (company as { id: string }).id;

  // 2. Link to Campaign
  await insertMissingCampaignCompanies(
    campaignId,
    [companyId],
    normalizeOptionalString(getString(formData, "campaign_status")) || "Added",
    normalizeOptionalString(getString(formData, "interest_level")) || "ICE Cold",
    normalizeOptionalString(getString(formData, "notes"))
  );

  // 3. Optional Contact
  const contactName = getString(formData, "contact_full_name");
  const contactEmail = getString(formData, "contact_email");

  if (contactName || contactEmail) {
    await contactsTable.insert({
      company_id: companyId,
      full_name: contactName || "Primary Contact",
      email: normalizeOptionalString(contactEmail),
      role_title: normalizeOptionalString(getString(formData, "contact_job_title")),
      phone: normalizeOptionalString(getString(formData, "contact_phone"))
    });
  }

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  redirect(`/campaigns/${campaignId}`);
}

export async function deleteCampaignAction(formData: FormData) {
  const campaignId = getString(formData, "id");
  if (!campaignId) throw new Error("Campaign ID is required.");

  const supabase = await createClient();
  const { error } = await (supabase.from("campaigns") as any).delete().eq("id", campaignId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/campaigns");
  redirect("/campaigns");
}


export async function updateLeadStatusAction(formData: FormData) {
  const campaignId = getString(formData, "campaign_id");
  const companyId = getString(formData, "company_id");
  const status = getString(formData, "status");
  const interestLevel = getString(formData, "interest_level");

  if (!campaignId || !companyId || (!status && !interestLevel)) {
    throw new Error("Campaign, company, and either status or interest level are required.");
  }

  const profile = (await getCurrentProfile()) as { id: string; role: string | null } | null;
  const supabase = await createClient();

  // Check permission: Admin or Owner
  if (profile?.role !== "admin") {
    const { data: campaign } = await (supabase
      .from("campaigns")
      .select("owner_id")
      .eq("id", campaignId)
      .maybeSingle() as any);
      
    if (campaign?.owner_id !== profile?.id) {
      throw new Error("Unauthorized: Only the campaign owner or an admin can update leads in this campaign.");
    }
  }

  const updatePayload: any = {};
  if (status) updatePayload.campaign_status = status;
  if (interestLevel) updatePayload.interest_level = interestLevel;

  const { error } = await (supabase.from("campaign_companies") as any)
    .update(updatePayload)
    .eq("campaign_id", campaignId)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/campaigns/${campaignId}`);
}
