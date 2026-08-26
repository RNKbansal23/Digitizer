import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TeacherClient from '@/app/teacher/TeacherClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function PrincipalClassView({ params }: { params: { classId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify they are a principal
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, school_id, role, schools(name)')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'principal' || !profile.school_id) {
    redirect('/login');
  }

  const schoolData = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
  const schoolName = schoolData?.name || 'School';

  return (
    <div>
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto p-4 flex items-center">
          <Link href="/principal" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center text-sm font-medium">
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
          </Link>
          <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">Principal View</span>
        </div>
      </div>
      
      {/* Reusing the TeacherClient but passing the Principal's name and the specific classId from the URL */}
      <TeacherClient 
        schoolId={profile.school_id} 
        classId={params.classId}
        teacherName={profile.name + " (Principal)"}
        schoolName={schoolName}
      />
    </div>
  );
}
