import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PrincipalClient from './PrincipalClient';

export default async function PrincipalDashboard({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, name, schools(name)')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.school_id) {
    return <div>Profile error</div>;
  }

  const schoolData = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
  const schoolName = schoolData?.name || 'School';

  // Fetch quotas (fallback to defaults if columns are missing)
  let maxStudents = 100;
  let maxTeachers = 10;
  const { data: schoolDetails, error: schoolErr } = await supabase
    .from('schools')
    .select('max_students, max_teachers')
    .eq('id', profile.school_id)
    .single();
    
  if (schoolDetails && !schoolErr) {
    maxStudents = schoolDetails.max_students ?? 100;
    maxTeachers = schoolDetails.max_teachers ?? 10;
  }

  // Fetch school stats
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', profile.school_id);

  const { count: teacherCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', profile.school_id)
    .eq('role', 'teacher');

  // Fetch legacy classes from profiles
  const { data: legacyClasses } = await supabase
    .from('profiles')
    .select('class_id, name')
    .eq('school_id', profile.school_id)
    .eq('role', 'teacher');

  // Fetch new classes from classes table
  const { data: newClasses } = await supabase
    .from('classes')
    .select('class_name, teacher_name')
    .eq('school_id', profile.school_id);

  // Merge classes
  const combinedClasses = [...(legacyClasses || []), ...(newClasses || [])];

  // Fetch teacher attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDate = searchParams.date || todayStr;
  
  const { data: teacherAttendance } = await supabase
    .from('teacher_attendance')
    .select('*, profiles!inner(name, class_id, role)')
    .eq('school_id', profile.school_id)
    .eq('date', selectedDate)
    .eq('profiles.role', 'teacher');

  return (
    <PrincipalClient 
      schoolId={profile.school_id}
      schoolName={schoolName}
      profileName={profile.name}
      studentCount={studentCount || 0}
      teacherCount={teacherCount || 0}
      maxStudents={maxStudents}
      maxTeachers={maxTeachers}
      classes={combinedClasses}
      teacherAttendance={teacherAttendance || []}
      initialDate={selectedDate}
    />
  );
}
