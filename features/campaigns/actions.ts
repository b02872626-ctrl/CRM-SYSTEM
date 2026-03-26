"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CampaignStatus, Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { isCampaignStatus } from "@/features/campaigns/constants";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function normalizeOptionalString(value: string) {
  return value ? value : null;
}

function ensureCompanyStatus(value: string) {
  const normalized = value.toLowerCase();

  if (
    normalized === "target" ||
    normalized === "researching" ||
    normalized === "contacted" ||
    normalized === "qualified" ||
    normalized === "inactive"
  ) {
    return normalized as Database["public"]["Tables"]["companies"]["Row"]["status"];
  }

  return "target";
}

function parseCsvRow(line: string, delimiter: string = ",") {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];

      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text: string) {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, "");
  
  const lines = cleanText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  // Detect delimiter: Check first line for tabs vs commas
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const delimiter = tabCount > commaCount ? "\t" : ",";

  const headers = parseCsvRow(lines[0], delimiter).map((h) => 
    h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line, delimiter);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      if (header) {
        row[header] = values[index] ?? "";
      }
    });

    return row;
  });
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
  const supabase = await createClient();
  const id = getString(formData, "id");

  if (!id) {
    throw new Error("Campaign id is required.");
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
    normalizeOptionalString(getString(formData, "notes"))
  );

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
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
  const companiesTable = supabase.from("companies") as unknown as {
    select: (columns: string) => {
      ilike: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
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
  const activitiesTable = supabase.from("activities") as unknown as {
    insert: (
      values: Database["public"]["Tables"]["activities"]["Insert"]
    ) => Promise<{ error: { message: string } | null }>;
  };

  const BATCH_SIZE = 10;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (row) => {
      const companyName = normalizeOptionalString((row.company_name ?? row.company ?? "").trim());
      console.log(`[Import] Processing row for company: "${companyName}"`);

      if (!companyName) {
        console.warn("[Import] Missing company name, skipping row:", row);
        return;
      }

      const ownerId = await getOwnerIdFromRow(supabase, row);
      const { data: existingCompany, error: existingCompanyError } = await companiesTable
        .select("id")
        .ilike("company_name", companyName)
        .maybeSingle();

      if (existingCompanyError) {
        throw new Error(existingCompanyError.message);
      }

      let companyId = existingCompany?.id ?? null;

      if (!companyId) {
        const companyPayload: Database["public"]["Tables"]["companies"]["Insert"] = {
          company_name: companyName,
          industry: normalizeOptionalString((row.industry ?? row.company_industry ?? "").trim()),
          company_size: normalizeOptionalString((row.company_size ?? row.size ?? row.employees ?? "").trim()),
          location: normalizeOptionalString((row.location ?? row.company_location ?? row.city ?? row.address ?? "").trim()),
          status: ensureCompanyStatus((row.status ?? row.company_status ?? "").trim()),
          owner_id: ownerId,
          notes: normalizeOptionalString((row.notes ?? row.description ?? row.about ?? "").trim())
        };

        const { data: createdCompany, error: companyError } = await companiesTable
          .insert(companyPayload)
          .select("id")
          .single();

        if (companyError) {
          throw new Error(companyError.message);
        }

        if (createdCompany) {
          companyId = createdCompany.id;
          console.log(`[Import] Created new company with ID: ${companyId}`);
        }
      } else {
        console.log(`[Import] Found existing company with ID: ${companyId}`);
      }
      
      if (!companyId) return;

      await insertMissingCampaignCompanies(
        campaignId,
        [companyId],
        normalizeOptionalString((row.campaign_status ?? "").trim()) ?? "Added",
        normalizeOptionalString((row.campaign_notes ?? row.notes ?? "").trim())
      );

      const contactFullName = normalizeOptionalString((row.contact_full_name ?? row.name ?? row.contact_name ?? row.contact ?? "").trim());
      const contactRoleTitle = normalizeOptionalString((row.contact_job_title ?? row.contact_role_title ?? row.contact_person_title ?? row.title ?? row.job_title ?? "").trim());
      const contactPhone = normalizeOptionalString((row.contact_phone ?? row.phone ?? "").trim());
      const contactEmail = normalizeOptionalString((row.contact_email ?? row.email ?? "").trim());

      if (contactFullName || contactRoleTitle || contactPhone || contactEmail) {
        const { error: contactError } = await contactsTable.insert({
          company_id: companyId,
          full_name: contactFullName ?? "Primary Contact",
          job_title: contactRoleTitle,
          phone: contactPhone,
          email: contactEmail
        });

        if (contactError) {
          console.error("[Import] Contact insert error:", contactError.message);
        }
      }

      const nextStep = normalizeOptionalString((row.next_step ?? "").trim());
      const nextStepDate = normalizeOptionalString((row.next_step_date ?? "").trim());

      if (nextStep) {
        const { error: activityError } = await activitiesTable.insert({
          company_id: companyId,
          profile_id: profile?.id ?? null,
          activity_type: "task",
          summary: nextStep,
          due_at: nextStepDate
        });

        if (activityError) {
          console.error("[Import] Activity insert error:", activityError.message);
        }
      }
    }));
  }

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  redirect(`/campaigns/${campaignId}`);
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
      job_title: normalizeOptionalString(getString(formData, "contact_job_title")),
      phone: normalizeOptionalString(getString(formData, "contact_phone"))
    });
  }

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/companies");
  redirect(`/campaigns/${campaignId}`);
}
