const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const date = '2026-08-31';
  const class_id = '5A';
  
  // Get a school id
  const { data: schools } = await supabase.from('schools').select('id').limit(1);
  if (!schools || schools.length === 0) return console.log('No schools');
  const school_id = schools[0].id;
  
  console.log('Testing get-log for date', date);
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .eq('class_id', class_id)
    .eq('school_id', school_id);
    
  console.log('Get Log result:', data, error);
}

test();
