-- View for campaign company counts (used in the campaigns list)
create or replace view public.view_campaign_stats as
select 
  campaign_id, 
  count(*) as lead_count
from public.campaign_companies
group by campaign_id;

-- Function for more complex campaign metrics (used in the detail view)
-- This avoids fetching thousands of rows to the client
create or replace function public.get_campaign_metrics_v2(p_campaign_id uuid)
returns table (
  linked_company_count bigint,
  qualified_company_count bigint,
  deals_created_count bigint
) as $$
declare
  l_company_ids uuid[];
begin
  -- Get counts directly
  select count(*) into linked_company_count
  from public.campaign_companies
  where campaign_id = p_campaign_id;

  select count(*) into qualified_company_count
  from public.campaign_companies cc
  left join public.companies c on c.id = cc.company_id
  where cc.campaign_id = p_campaign_id
    and (lower(cc.campaign_status) = 'qualified' or lower(c.status) = 'qualified');

  -- Get deals count for those companies
  select count(d.id) into deals_created_count
  from public.deals d
  where d.company_id in (
    select cc.company_id 
    from public.campaign_companies cc 
    where cc.campaign_id = p_campaign_id
  );

  return next;
end;
$$ language plpgsql security definer;
