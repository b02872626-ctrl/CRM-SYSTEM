-- Migration to add interest_level to campaign_companies
alter table public.campaign_companies 
add column if not exists interest_level text default 'ICE Cold';

-- Update existing rows (optional, but good for consistency)
update public.campaign_companies set interest_level = 'ICE Cold' where interest_level is null;
