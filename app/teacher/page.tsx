import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TeacherClient from './TeacherClient';

export default async function TeacherDashboardServer() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('class_id, name, school_id, schools(name)')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.school_id || !profile.class_id) {
    return <div className="p-8 text-center text-red-500 font-bold">Profile misconfigured. Missing class or school assignment.</div>;
  }

  const schoolData = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
  const schoolName = schoolData?.name || 'School';

  return (
    <TeacherClient 
      schoolId={profile.school_id} 
      classId={profile.class_id}
      teacherName={profile.name}
      schoolName={schoolName}
    />
  );
}