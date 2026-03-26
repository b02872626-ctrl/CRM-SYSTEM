-- Add covering index for faster campaign company counts
create index if not exists idx_campaign_companies_campaign_id_count on public.campaign_companies (campaign_id);

-- Ensure there is an index for updated_at sorting on companies for the list page
create index if not exists idx_companies_updated_at on public.companies (updated_at desc);

-- Index for deal company lookups which happens in campaign details
create index if not exists idx_deals_company_id on public.deals (company_id);
