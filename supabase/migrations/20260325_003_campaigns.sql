begin;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  campaign_type text,
  target_audience text,
  status text not null default 'Draft'
    check (status in ('Draft', 'Active', 'Paused', 'Completed', 'Archived')),
  owner_id uuid references public.profiles(id) on delete set null,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_companies (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  campaign_status text,
  added_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint campaign_companies_campaign_company_unique unique (campaign_id, company_id)
);

create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaigns_owner_id_idx on public.campaigns(owner_id);
create index if not exists campaigns_updated_at_idx on public.campaigns(updated_at desc);
create index if not exists campaign_companies_campaign_id_idx on public.campaign_companies(campaign_id);
create index if not exists campaign_companies_company_id_idx on public.campaign_companies(company_id);
create index if not exists campaign_companies_status_idx on public.campaign_companies(campaign_status);

drop trigger if exists set_campaigns_updated_at on public.campaigns;
create trigger set_campaigns_updated_at
before update on public.campaigns
for each row execute function public.set_updated_at();

drop trigger if exists set_campaign_companies_updated_at on public.campaign_companies;
create trigger set_campaign_companies_updated_at
before update on public.campaign_companies
for each row execute function public.set_updated_at();

commit;
