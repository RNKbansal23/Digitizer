const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const i = line.indexOf('=');
  if(i > -1) process.env[line.substring(0, i)] = line.substring(i + 1).trim();
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('classes').delete().eq('class_name', '6B');
  if (error) console.error(error);
  else console.log('Deleted 6B from classes successfully.');
}
main();
