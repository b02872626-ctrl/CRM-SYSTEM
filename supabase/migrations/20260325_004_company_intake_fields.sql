begin;

alter table public.companies
  add column if not exists location text,
  add column if not exists source text,
  add column if not exists hiring_signal text,
  add column if not exists priority text;

create index if not exists companies_priority_idx on public.companies(priority);
create index if not exists companies_source_idx on public.companies(source);

commit;
