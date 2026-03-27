insert into public.profiles (id, full_name, email, role, job_title)
values
  ('10000000-0000-0000-0000-000000000001', 'Amina Hassan', 'amina@afriworkbpo.com', 'admin', 'Operations Lead'),
  ('10000000-0000-0000-0000-000000000002', 'David Mwangi', 'david@afriworkbpo.com', 'sales', 'Business Development Manager'),
  ('10000000-0000-0000-0000-000000000003', 'Grace Njeri', 'grace@afriworkbpo.com', 'sales', 'Talent Partner');

insert into public.companies (
  id,
  name,
  website,
  industry,
  country,
  company_size,
  status,
  owner_profile_id,
  notes
)
values
  ('20000000-0000-0000-0000-000000000001', 'Savanna Health', 'https://savannahealth.example', 'HealthTech', 'Kenya', '51-200', 'qualified', '10000000-0000-0000-0000-000000000002', 'Warm outbound conversations started.'),
  ('20000000-0000-0000-0000-000000000002', 'BluePeak Logistics', 'https://bluepeaklogistics.example', 'Logistics', 'Uganda', '201-500', 'contacted', '10000000-0000-0000-0000-000000000002', 'Interested in outsourcing support operations.'),
  ('20000000-0000-0000-0000-000000000003', 'Nile Commerce', 'https://nilecommerce.example', 'E-commerce', 'Egypt', '51-200', 'researching', '10000000-0000-0000-0000-000000000001', 'Needs more decision-maker research.'),
  ('20000000-0000-0000-0000-000000000004', 'Kijani Energy', 'https://kijanienergy.example', 'Energy', 'Tanzania', '11-50', 'target', '10000000-0000-0000-0000-000000000002', 'New strategic account target.'),
  ('20000000-0000-0000-0000-000000000005', 'Atlas Finserve', 'https://atlasfinserve.example', 'FinTech', 'Nigeria', '201-500', 'contacted', '10000000-0000-0000-0000-000000000001', 'Requested service capability overview.');

insert into public.contacts (
  id,
  company_id,
  owner_profile_id,
  full_name,
  job_title,
  email,
  phone,
  linkedin_url,
  status
)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Lilian Otieno', 'Head of Operations', 'lilian@savannahealth.example', '+254700100001', 'https://linkedin.com/in/lilianotieno', 'active'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Mark Were', 'People Lead', 'mark@savannahealth.example', '+254700100002', 'https://linkedin.com/in/markwere', 'active'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sarah Okello', 'Customer Support Director', 'sarah@bluepeaklogistics.example', '+256700100003', 'https://linkedin.com/in/sarahokello', 'active'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Omar Fathy', 'Founder', 'omar@nilecommerce.example', '+201000100004', 'https://linkedin.com/in/omarfathy', 'unresponsive'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Zainab Bello', 'COO', 'zainab@atlasfinserve.example', '+234800100005', 'https://linkedin.com/in/zainabbello', 'active'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'John Mrema', 'General Manager', 'john@kijanienergy.example', '+255700100006', 'https://linkedin.com/in/johnmrema', 'active');

insert into public.deals (
  id,
  company_id,
  primary_contact_id,
  assigned_profile_id,
  title,
  number_of_hires,
  seniority,
  urgency,
  stage,
  value,
  currency,
  expected_close_date,
  notes
)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Customer Support Associates', 6, 'mid', 'high', 'proposal', 18000.00, 'USD', current_date + interval '21 day', 'Proposal shared for multilingual support team.'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Senior CX Team Leads', 4, 'senior', 'medium', 'qualified', 12000.00, 'USD', current_date + interval '30 day', 'Pilot scope agreed in discovery call.'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Back Office Specialists', 8, 'mid', 'critical', 'negotiation', 26000.00, 'USD', current_date + interval '14 day', 'Commercial negotiation in progress.');

insert into public.candidates (
  id,
  assigned_profile_id,
  first_name,
  last_name,
  email,
  phone,
  location,
  source,
  stage,
  current_title,
  linkedin_url
)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Brian', 'Kimani', 'brian.kimani@example.com', '+254711000001', 'Nairobi, Kenya', 'Referral', 'screening', 'Customer Support Specialist', 'https://linkedin.com/in/briankimani'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Faith', 'Achieng', 'faith.achieng@example.com', '+254711000002', 'Kisumu, Kenya', 'LinkedIn', 'interview', 'Operations Analyst', 'https://linkedin.com/in/faithachieng'),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Irene', 'Namutebi', 'irene.namutebi@example.com', '+256711000003', 'Kampala, Uganda', 'Referral', 'shortlisted', 'Team Lead', 'https://linkedin.com/in/irenenamutebi'),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Kelvin', 'Mutua', 'kelvin.mutua@example.com', '+254711000004', 'Mombasa, Kenya', 'Inbound', 'sourced', 'Back Office Associate', 'https://linkedin.com/in/kelvinmutua'),
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Naomi', 'Bwire', 'naomi.bwire@example.com', '+254711000005', 'Nakuru, Kenya', 'LinkedIn', 'screening', 'Customer Experience Agent', 'https://linkedin.com/in/naomibwire'),
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Peter', 'Odhiambo', 'peter.odhiambo@example.com', '+254711000006', 'Nairobi, Kenya', 'Referral', 'placed', 'QA Analyst', 'https://linkedin.com/in/peterodhiambo'),
  ('50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Ruth', 'Namusoke', 'ruth.namusoke@example.com', '+256711000007', 'Kampala, Uganda', 'Inbound', 'interview', 'Support Supervisor', 'https://linkedin.com/in/ruthnamusoke'),
  ('50000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'Samuel', 'Tesfaye', 'samuel.tesfaye@example.com', '+251911000008', 'Addis Ababa, Ethiopia', 'LinkedIn', 'on_hold', 'Data Entry Specialist', 'https://linkedin.com/in/samueltesfaye');

insert into public.candidate_applications (
  id,
  candidate_id,
  deal_id,
  assigned_profile_id,
  status,
  applied_at,
  last_stage_at,
  notes
)
values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'screening', timezone('utc', now()) - interval '6 day', timezone('utc', now()) - interval '2 day', 'Initial screening completed.'),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'interview', timezone('utc', now()) - interval '10 day', timezone('utc', now()) - interval '1 day', 'Interview scheduled with client.'),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'submitted', timezone('utc', now()) - interval '8 day', timezone('utc', now()) - interval '3 day', 'Candidate submitted to BluePeak.'),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'offer', timezone('utc', now()) - interval '12 day', timezone('utc', now()) - interval '1 day', 'Offer draft pending approval.');

insert into public.activities (
  id,
  profile_id,
  company_id,
  deal_id,
  candidate_id,
  candidate_application_id,
  activity_type,
  summary,
  details,
  due_at,
  completed_at
)
values
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', null, null, 'meeting', 'Proposal review meeting', 'Review proposal pricing and staffing assumptions with Savanna Health.', timezone('utc', now()) + interval '2 day', null),
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', null, '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'status_change', 'Candidate moved to interview', 'Faith advanced after internal recruiter review.', null, timezone('utc', now()) - interval '1 day'),
  ('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', null, null, 'call', 'Commercial follow-up', 'Follow up on pricing feedback from Atlas Finserve.', timezone('utc', now()) + interval '1 day', null);
