const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      id,
      company_name,
      contacts(id, full_name, role_title, email, phone)
    `)
    .ilike('company_name', '%Virtuclock%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Virtuclock companies and contacts:', JSON.stringify(data, null, 2));

  if (data && data.length > 0) {
    const { data: links } = await supabase
      .from('campaign_companies')
      .select('*')
      .eq('company_id', data[0].id);
    console.log('Links:', JSON.stringify(links, null, 2));
  }
}

main();
