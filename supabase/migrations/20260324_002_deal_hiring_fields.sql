create type public.deal_seniority as enum (
  'junior',
  'mid',
  'senior',
  'lead',
  'executive'
);

create type public.deal_urgency as enum ('low', 'medium', 'high', 'critical');

alter table public.deals
add column number_of_hires integer not null default 1,
add column seniority public.deal_seniority not null default 'mid',
add column urgency public.deal_urgency not null default 'medium';

alter table public.deals
add constraint deals_number_of_hires_check check (number_of_hires > 0);

create index deals_stage_urgency_idx on public.deals (stage, urgency);
create index deals_recruiter_urgency_idx on public.deals (assigned_profile_id, urgency);

update public.deals
set
  number_of_hires = case id
    when '40000000-0000-0000-0000-000000000001' then 6
    when '40000000-0000-0000-0000-000000000002' then 4
    when '40000000-0000-0000-0000-000000000003' then 8
    else 1
  end,
  seniority = case id
    when '40000000-0000-0000-0000-000000000001' then 'mid'::public.deal_seniority
    when '40000000-0000-0000-0000-000000000002' then 'senior'::public.deal_seniority
    when '40000000-0000-0000-0000-000000000003' then 'mid'::public.deal_seniority
    else 'mid'::public.deal_seniority
  end,
  urgency = case id
    when '40000000-0000-0000-0000-000000000001' then 'high'::public.deal_urgency
    when '40000000-0000-0000-0000-000000000002' then 'medium'::public.deal_urgency
    when '40000000-0000-0000-0000-000000000003' then 'critical'::public.deal_urgency
    else 'medium'::public.deal_urgency
  end;
