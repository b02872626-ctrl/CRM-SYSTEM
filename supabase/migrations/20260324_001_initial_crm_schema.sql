create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'manager', 'agent', 'recruiter');
create type public.company_status as enum (
  'target',
  'researching',
  'contacted',
  'qualified',
  'inactive'
);
create type public.contact_status as enum ('active', 'unresponsive', 'do_not_contact');
create type public.deal_stage as enum (
  'new',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);
create type public.candidate_stage as enum (
  'sourced',
  'screening',
  'interview',
  'shortlisted',
  'placed',
  'rejected',
  'on_hold'
);
create type public.application_status as enum (
  'applied',
  'screening',
  'interview',
  'submitted',
  'offer',
  'placed',
  'rejected',
  'withdrawn'
);
create type public.activity_type as enum (
  'note',
  'call',
  'email',
  'meeting',
  'status_change',
  'task'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  email text not null unique,
  role public.profile_role not null default 'agent',
  job_title text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text,
  country text,
  company_size text,
  status public.company_status not null default 'target',
  owner_profile_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  owner_profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  job_title text,
  email text,
  phone text,
  linkedin_url text,
  status public.contact_status not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contacts_email_format_check
    check (email is null or position('@' in email) > 1)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  primary_contact_id uuid references public.contacts (id) on delete set null,
  assigned_profile_id uuid references public.profiles (id) on delete set null,
  title text not null,
  stage public.deal_stage not null default 'new',
  value numeric(12, 2),
  currency text not null default 'USD',
  expected_close_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint deals_currency_check check (char_length(currency) = 3)
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  assigned_profile_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  location text,
  source text,
  stage public.candidate_stage not null default 'sourced',
  current_title text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint candidates_email_format_check
    check (email is null or position('@' in email) > 1)
);

create table public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  assigned_profile_id uuid references public.profiles (id) on delete set null,
  status public.application_status not null default 'applied',
  applied_at timestamptz not null default timezone('utc', now()),
  last_stage_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint candidate_applications_unique_candidate_deal unique (candidate_id, deal_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  company_id uuid references public.companies (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete cascade,
  candidate_id uuid references public.candidates (id) on delete cascade,
  candidate_application_id uuid references public.candidate_applications (id) on delete cascade,
  activity_type public.activity_type not null,
  summary text not null,
  details text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint activities_target_check check (
    company_id is not null
    or contact_id is not null
    or deal_id is not null
    or candidate_id is not null
    or candidate_application_id is not null
  )
);

create index profiles_email_idx on public.profiles (email);
create index profiles_role_idx on public.profiles (role) where is_active = true;

create index companies_status_idx on public.companies (status);
create index companies_owner_status_idx on public.companies (owner_profile_id, status);
create index companies_updated_at_idx on public.companies (updated_at desc);
create unique index companies_name_lower_idx on public.companies (lower(name));

create index contacts_company_idx on public.contacts (company_id);
create index contacts_owner_idx on public.contacts (owner_profile_id);
create index contacts_status_idx on public.contacts (status);
create index contacts_email_idx on public.contacts (email) where email is not null;

create index deals_company_stage_idx on public.deals (company_id, stage);
create index deals_assigned_stage_idx on public.deals (assigned_profile_id, stage);
create index deals_expected_close_idx on public.deals (expected_close_date);
create index deals_updated_at_idx on public.deals (updated_at desc);

create index candidates_stage_idx on public.candidates (stage);
create index candidates_assigned_stage_idx on public.candidates (assigned_profile_id, stage);
create index candidates_email_idx on public.candidates (email) where email is not null;
create index candidates_updated_at_idx on public.candidates (updated_at desc);

create index candidate_applications_candidate_idx on public.candidate_applications (candidate_id);
create index candidate_applications_deal_idx on public.candidate_applications (deal_id);
create index candidate_applications_status_idx on public.candidate_applications (status);
create index candidate_applications_assigned_status_idx
  on public.candidate_applications (assigned_profile_id, status);

create index activities_company_created_idx on public.activities (company_id, created_at desc);
create index activities_deal_created_idx on public.activities (deal_id, created_at desc);
create index activities_candidate_created_idx on public.activities (candidate_id, created_at desc);
create index activities_profile_created_idx on public.activities (profile_id, created_at desc);
create index activities_type_created_idx on public.activities (activity_type, created_at desc);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_companies_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

create trigger set_deals_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();

create trigger set_candidates_updated_at
before update on public.candidates
for each row
execute function public.set_updated_at();

create trigger set_candidate_applications_updated_at
before update on public.candidate_applications
for each row
execute function public.set_updated_at();

create trigger set_activities_updated_at
before update on public.activities
for each row
execute function public.set_updated_at();
