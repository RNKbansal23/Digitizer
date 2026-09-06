const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const i = line.indexOf('=');
  if(i > -1) process.env[line.substring(0, i)] = line.substring(i + 1).trim();
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const schoolId = 'e850d0a0-89a7-4764-ae09-4fd2e5504cf2';
  
  // Set school_id for students where it's null
  await supabase.from('students').update({ school_id: schoolId }).is('school_id', null);
  
  // Delete "Class 6B" from classes
  await supabase.from('classes').delete().eq('class_name', 'Class 6B');
  
  // Also delete students belonging to that class just in case
  await supabase.from('students').delete().eq('class_id', 'Class%206B');
  
  console.log('Fixed DB successfully');
}
main();
