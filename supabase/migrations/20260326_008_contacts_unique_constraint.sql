begin;

-- Add unique constraint to contacts to allow upsert by company and email
alter table public.contacts
add constraint contacts_company_id_email_key unique (company_id, email);

commit;
